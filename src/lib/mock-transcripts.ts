// Task #15: Mock transcript data for testing
import { TranscriptData } from '../store/app.store';

export const mockTranscripts: TranscriptData[] = [
  {
    id: '1',
    filename: 'Building a Modern SaaS Application.mp4',
    word_count: 3250,
    language: 'en',
    content_preview: 'Today we\'re going to talk about building a modern SaaS application from scratch. We\'ll cover architecture, technology choices, and best practices...',
    full_content: 'Today we\'re going to talk about building a modern SaaS application from scratch. We\'ll cover architecture, technology choices, and best practices for creating scalable, maintainable applications...',
    imported_at: '2025-01-06T10:00:00Z',
    status: 'imported',
    tags: [
      { tag: 'saas', relevance: 0.95 },
      { tag: 'architecture', relevance: 0.88 },
      { tag: 'development', relevance: 0.82 },
      { tag: 'scalability', relevance: 0.79 },
      { tag: 'best-practices', relevance: 0.75 }
    ],
    content_score: 0.85,
    rating: 5,
    platform_scores: {
      thread: 0.92,
      carousel: 0.78,
      blog: 0.95
    }
  },
  {
    id: '2',
    filename: 'Introduction to Machine Learning.mp4',
    word_count: 4120,
    language: 'en',
    content_preview: 'Machine learning is revolutionizing how we solve complex problems. In this video, we explore the fundamentals...',
    full_content: 'Machine learning is revolutionizing how we solve complex problems. In this video, we explore the fundamentals of ML algorithms, neural networks, and practical applications...',
    imported_at: '2025-01-05T14:30:00Z',
    status: 'imported',
    tags: [
      { tag: 'machine-learning', relevance: 0.97 },
      { tag: 'ai', relevance: 0.92 },
      { tag: 'data-science', relevance: 0.85 },
      { tag: 'algorithms', relevance: 0.80 },
      { tag: 'python', relevance: 0.75 }
    ],
    content_score: 0.91,
    rating: 4,
    platform_scores: {
      thread: 0.88,
      carousel: 0.92,
      blog: 0.90
    }
  },
  {
    id: '3',
    filename: 'DevOps Best Practices in 2025.mp4',
    word_count: 2890,
    language: 'en',
    content_preview: 'DevOps continues to evolve. Here are the best practices every team should follow in 2025...',
    full_content: 'DevOps continues to evolve. Here are the best practices every team should follow in 2025, including CI/CD pipelines, infrastructure as code, and monitoring strategies...',
    imported_at: '2025-01-04T09:15:00Z',
    status: 'imported',
    tags: [
      { tag: 'devops', relevance: 0.93 },
      { tag: 'ci-cd', relevance: 0.87 },
      { tag: 'kubernetes', relevance: 0.82 },
      { tag: 'monitoring', relevance: 0.78 },
      { tag: 'automation', relevance: 0.74 }
    ],
    content_score: 0.78,
    rating: 4,
    platform_scores: {
      thread: 0.85,
      carousel: 0.72,
      blog: 0.88
    }
  },
  {
    id: '4',
    filename: 'React Performance Optimization.mp4',
    word_count: 2650,
    language: 'en',
    content_preview: 'Let\'s dive deep into React performance optimization techniques that will make your apps lightning fast...',
    full_content: 'Let\'s dive deep into React performance optimization techniques that will make your apps lightning fast. We\'ll cover memoization, lazy loading, and advanced patterns...',
    imported_at: '2025-01-03T16:45:00Z',
    status: 'imported',
    tags: [
      { tag: 'react', relevance: 0.96 },
      { tag: 'performance', relevance: 0.91 },
      { tag: 'optimization', relevance: 0.88 },
      { tag: 'javascript', relevance: 0.83 },
      { tag: 'web-development', relevance: 0.77 }
    ],
    content_score: 0.82,
    rating: 5,
    platform_scores: {
      thread: 0.90,
      carousel: 0.86,
      blog: 0.84
    }
  },
  {
    id: '5',
    filename: 'Database Design Fundamentals.mp4',
    word_count: 3480,
    language: 'en',
    content_preview: 'Understanding database design is crucial for any developer. We\'ll explore normalization, indexing, and query optimization...',
    full_content: 'Understanding database design is crucial for any developer. We\'ll explore normalization, indexing, and query optimization strategies for both SQL and NoSQL databases...',
    imported_at: '2025-01-02T11:20:00Z',
    status: 'imported',
    tags: [
      { tag: 'database', relevance: 0.94 },
      { tag: 'sql', relevance: 0.89 },
      { tag: 'nosql', relevance: 0.84 },
      { tag: 'optimization', relevance: 0.79 },
      { tag: 'design-patterns', relevance: 0.73 }
    ],
    content_score: 0.87,
    rating: 3,
    platform_scores: {
      thread: 0.82,
      carousel: 0.75,
      blog: 0.93
    }
  },
  {
    id: '6',
    filename: 'Microservices Architecture Deep Dive.mp4',
    word_count: 4250,
    language: 'en',
    content_preview: 'Microservices architecture has become the standard for large-scale applications. Let\'s explore the patterns and practices...',
    full_content: 'Microservices architecture has become the standard for large-scale applications. Let\'s explore the patterns, practices, and challenges of building distributed systems...',
    imported_at: '2025-01-01T13:00:00Z',
    status: 'imported',
    tags: [
      { tag: 'microservices', relevance: 0.96 },
      { tag: 'architecture', relevance: 0.92 },
      { tag: 'distributed-systems', relevance: 0.87 },
      { tag: 'api-design', relevance: 0.81 },
      { tag: 'docker', relevance: 0.76 }
    ],
    content_score: 0.89,
    platform_scores: {
      thread: 0.87,
      carousel: 0.83,
      blog: 0.91
    }
  },
  {
    id: '7',
    filename: 'Security Best Practices for Web Apps.mp4',
    word_count: 3120,
    language: 'en',
    content_preview: 'Security should be a top priority. In this comprehensive guide, we cover authentication, authorization, and common vulnerabilities...',
    full_content: 'Security should be a top priority. In this comprehensive guide, we cover authentication, authorization, OWASP top 10, and how to protect your applications...',
    imported_at: '2024-12-30T15:30:00Z',
    status: 'imported',
    tags: [
      { tag: 'security', relevance: 0.98 },
      { tag: 'authentication', relevance: 0.91 },
      { tag: 'owasp', relevance: 0.86 },
      { tag: 'web-security', relevance: 0.82 },
      { tag: 'best-practices', relevance: 0.77 }
    ],
    content_score: 0.93,
    rating: 5,
    platform_scores: {
      thread: 0.94,
      carousel: 0.88,
      blog: 0.96
    }
  },
  {
    id: '8',
    filename: 'GraphQL vs REST API Design.mp4',
    word_count: 2980,
    language: 'en',
    content_preview: 'The debate between GraphQL and REST continues. Let\'s examine the pros and cons of each approach...',
    full_content: 'The debate between GraphQL and REST continues. Let\'s examine the pros and cons of each approach, when to use which, and how to design efficient APIs...',
    imported_at: '2024-12-29T10:45:00Z',
    status: 'imported',
    tags: [
      { tag: 'graphql', relevance: 0.93 },
      { tag: 'rest-api', relevance: 0.90 },
      { tag: 'api-design', relevance: 0.87 },
      { tag: 'backend', relevance: 0.80 },
      { tag: 'comparison', relevance: 0.74 }
    ],
    content_score: 0.81,
    rating: 4,
    platform_scores: {
      thread: 0.89,
      carousel: 0.85,
      blog: 0.83
    }
  }
];