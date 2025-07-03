// Mock content generator for testing without LangChain
// This simulates the AI content generation

export interface MockGenerationResult {
  title: string;
  content: string | string[];
  format: string;
  metadata: {
    generatedAt: string;
    wordCount: number;
  };
}

export async function generateMockContent(
  transcripts: Array<{ id: string; content: string }>,
  templateType: string,
  constraints?: Record<string, any>
): Promise<MockGenerationResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const transcriptText = transcripts.map(t => t.content).join('\n\n');
  const wordCount = transcriptText.split(/\s+/).length;
  
  switch (templateType) {
    case 'twitter-thread':
      return {
        title: "10 Key Insights from Today's Content",
        content: [
          "🧵 Here are the top insights from our discussion today:",
          "1/ The first key point is about understanding your audience and their needs.",
          "2/ Content creation is not just about quantity, but quality and relevance.",
          "3/ Consistency in your messaging helps build trust with your audience.",
          "4/ Always provide value - educate, entertain, or inspire.",
          "5/ Engagement is a two-way street - respond to your community.",
          "6/ Use data to inform your content strategy, but don't lose the human touch.",
          "7/ Repurposing content across platforms maximizes your reach.",
          "8/ Authenticity beats perfection every time.",
          "9/ Collaborate with others to expand your perspective and audience.",
          "10/ Remember: Content is king, but distribution is queen. Both matter!"
        ],
        format: 'thread',
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 100
        }
      };
      
    case 'instagram-carousel':
      return {
        title: "5 Content Creation Tips",
        content: [
          "Slide 1: 5 CONTENT CREATION TIPS\n\nSwipe for game-changing insights →",
          "Slide 2: KNOW YOUR AUDIENCE\n\n• Research their pain points\n• Understand their goals\n• Speak their language",
          "Slide 3: QUALITY > QUANTITY\n\n• One great post beats 10 mediocre ones\n• Focus on providing real value\n• Edit ruthlessly",
          "Slide 4: BE CONSISTENT\n\n• Post regularly\n• Maintain your brand voice\n• Build trust through reliability",
          "Slide 5: ENGAGE AUTHENTICALLY\n\n• Reply to comments\n• Ask questions\n• Build a community, not just followers"
        ],
        format: 'carousel',
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 80
        }
      };
      
    case 'linkedin-article':
      return {
        title: "The Future of Content Creation: Lessons from Industry Leaders",
        content: `# The Future of Content Creation: Lessons from Industry Leaders

In today's digital landscape, content creation has evolved from a nice-to-have to a business imperative. Here are the key insights from our recent analysis:

## Understanding Your Audience

The foundation of effective content creation lies in deeply understanding your audience. This goes beyond demographics to psychographics - understanding their motivations, challenges, and aspirations.

## Quality Over Quantity

While consistency matters, the push for constant content has led many creators astray. The most successful content strategies focus on creating fewer, higher-quality pieces that truly resonate with their audience.

## The Power of Authenticity

In an era of AI-generated content and polished perfection, authenticity stands out. Your unique perspective and genuine voice are your greatest differentiators.

## Measuring What Matters

Vanity metrics like likes and follows tell only part of the story. Focus on engagement rates, conversion metrics, and actual business outcomes.

## Looking Ahead

The future of content creation will be shaped by emerging technologies, changing consumer preferences, and new platforms. Stay adaptable, keep learning, and always put your audience first.

What's your take on the future of content creation? Share your thoughts in the comments below.`,
        format: 'blog',
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 200
        }
      };
      
    case 'youtube-script':
      return {
        title: "How to Create Engaging Content in 2024",
        content: `[INTRO - 0:00-0:15]
Hey everyone! Welcome back to the channel. Today we're diving into the secrets of creating engaging content that actually connects with your audience.

[HOOK - 0:15-0:30]
If you've been struggling to get views, engagement, or just feeling stuck with your content, this video is for you. I'm sharing 5 proven strategies that transformed my content game.

[MAIN CONTENT - 0:30-4:00]
Strategy #1: Start with Why
Before creating any content, ask yourself: Why would someone watch this? What problem am I solving?

Strategy #2: The Hook is Everything
You have 3 seconds to grab attention. Make them count with a bold statement, question, or preview.

Strategy #3: Structure for Success
Use the APP method: Attention, Promise, Proof. Grab attention, make a promise, then deliver proof.

Strategy #4: Engage Throughout
Ask questions, use pattern interrupts, and change up your pacing to maintain interest.

Strategy #5: Clear Call-to-Action
Tell viewers exactly what to do next. Subscribe, comment, or check out your other content.

[OUTRO - 4:00-4:30]
That's it for today's video! If you found this helpful, smash that like button and subscribe for more content creation tips. What's your biggest content challenge? Let me know in the comments below!`,
        format: 'video-script',
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 220
        }
      };
      
    default:
      return {
        title: "Generated Content",
        content: "This is placeholder content for the selected template type.",
        format: 'text',
        metadata: {
          generatedAt: new Date().toISOString(),
          wordCount: 10
        }
      };
  }
}