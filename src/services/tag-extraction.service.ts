// Task #14: AI-Powered Tag Extraction Service
import { invoke } from '../lib/tauri-wrapper';
import { TranscriptAnalysisWorkflow } from '../workflows/transcript-analysis.workflow';
import { loadConfig } from '../config/workflow.config';
import { toast } from 'sonner';

export interface ExtractedTag {
  tag: string;
  relevance: number;
}

export interface TagExtractionResult {
  transcriptId: string;
  tags: ExtractedTag[];
  contentScore: number;
  platformScores: {
    thread: number;
    carousel: number;
    blog: number;
  };
}

export interface TranscriptWithTags {
  transcriptId: string;
  filename: string;
  tags: ExtractedTag[];
  contentScore: number;
}

export class TagExtractionService {
  private workflow: TranscriptAnalysisWorkflow;
  
  constructor() {
    const config = loadConfig();
    this.workflow = new TranscriptAnalysisWorkflow(config);
  }
  
  /**
   * Extract tags from a transcript using AI and store them in the database
   */
  async extractAndStoreTags(transcriptId: string, transcriptContent: string): Promise<TagExtractionResult> {
    try {
      // Run the AI workflow to analyze transcript and extract tags
      const result = await this.workflow.run({
        transcript: transcriptContent,
        transcriptId,
        messages: [],
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      if (!result.analysis) {
        throw new Error('No analysis result from workflow');
      }
      
      // Prepare tags with relevance scores
      const tags: ExtractedTag[] = result.analysis.tags.map(tag => ({
        tag,
        relevance: result.analysis?.tagScores?.[tag] || 0.5,
      }));
      
      // Store tags in database via Tauri command
      await invoke('extract_and_store_tags', {
        transcriptId,
        tags,
        contentScore: result.analysis.contentScore || 0.5,
      });
      
      return {
        transcriptId,
        tags,
        contentScore: result.analysis.contentScore || 0.5,
        platformScores: result.analysis.platformScores || {
          thread: 0.5,
          carousel: 0.5,
          blog: 0.5,
        },
      };
    } catch (error) {
      console.error('Failed to extract tags:', error);
      toast.error('Failed to extract tags from transcript');
      throw error;
    }
  }
  
  /**
   * Extract tags for multiple transcripts in batch
   */
  async extractTagsForBatch(transcripts: Array<{ id: string; content: string }>): Promise<TagExtractionResult[]> {
    const results: TagExtractionResult[] = [];
    const batchSize = 3; // Process 3 transcripts at a time to avoid rate limits
    
    for (let i = 0; i < transcripts.length; i += batchSize) {
      const batch = transcripts.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchPromises = batch.map(transcript => 
        this.extractAndStoreTags(transcript.id, transcript.content)
          .catch(error => {
            console.error(`Failed to extract tags for transcript ${transcript.id}:`, error);
            return null;
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null) as TagExtractionResult[]);
      
      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < transcripts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
  
  /**
   * Get tags for a specific transcript
   */
  async getTranscriptTags(transcriptId: string): Promise<ExtractedTag[]> {
    try {
      const tags = await invoke<ExtractedTag[]>('get_transcript_tags', { transcriptId });
      return tags;
    } catch (error) {
      console.error('Failed to get transcript tags:', error);
      return [];
    }
  }
  
  /**
   * Get all tags with usage counts
   */
  async getAllTags(): Promise<Array<{ tag: string; count: number }>> {
    try {
      const tags = await invoke<Array<[string, number]>>('get_all_tags');
      return tags.map(([tag, count]) => ({ tag, count }));
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return [];
    }
  }
  
  /**
   * Process newly imported transcripts to extract tags
   */
  async processNewTranscripts(transcriptIds: string[]): Promise<void> {
    const toastId = toast.loading('Extracting tags from transcripts...');
    
    try {
      // Fetch transcript content for each ID
      const transcripts = await Promise.all(
        transcriptIds.map(async id => {
          const transcript = await invoke<any>('get_transcript_by_id', { transcriptId: id });
          return { id, content: transcript.content };
        })
      );
      
      // Extract tags in batches
      const results = await this.extractTagsForBatch(transcripts);
      
      toast.success(`Successfully extracted tags from ${results.length} transcripts`, { id: toastId });
    } catch (error) {
      toast.error('Failed to process transcripts for tag extraction', { id: toastId });
      throw error;
    }
  }
}

export const tagExtractionService = new TagExtractionService();