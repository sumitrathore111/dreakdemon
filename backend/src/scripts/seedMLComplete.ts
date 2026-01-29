import dotenv from 'dotenv';
import mongoose from 'mongoose';
import {
    CareerInfo,
    InterviewQuestion,
    Roadmap,
    Topic
} from '../models/Roadmap';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codetermite';

async function seedMLRoadmap() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing roadmap data...');
    await Promise.all([
      Roadmap.deleteMany({}),
      Topic.deleteMany({}),
      InterviewQuestion.deleteMany({}),
      CareerInfo.deleteMany({})
    ]);

    // ==================== MACHINE LEARNING ROADMAP ====================
    console.log('🤖 Creating Machine Learning Roadmap...');

    const mlRoadmap = await Roadmap.create({
      title: 'Machine Learning & AI',
      slug: 'machine-learning',
      description: 'Complete journey from Python basics to production ML systems. Master algorithms, deep learning, and real-world deployment.',
      longDescription: `This comprehensive Machine Learning roadmap takes you from absolute beginner to job-ready ML Engineer. You'll master Python, mathematics, classical ML algorithms, deep learning with TensorFlow/PyTorch, and production deployment.`,
      icon: '🤖',
      color: '#8B5CF6',
      category: 'ai-ml',
      difficulty: 'all-levels',
      estimatedWeeks: 28,
      isPublished: true,
      isFeatured: true,
      totalTopics: 0,
      totalQuestions: 0,
      enrolledCount: 1250,
      rating: 4.9,
      prerequisites: ['Basic programming knowledge', 'High school mathematics', 'Curiosity to learn'],
      outcomes: ['Build neural networks from scratch', 'Deploy ML models to production', 'Ace ML interviews at top companies'],
      tags: ['python', 'tensorflow', 'pytorch', 'deep-learning', 'scikit-learn']
    });

    // ==================== ML TOPICS WITH PROJECTS ====================
    console.log('📖 Creating ML Topics with Projects...');

    const mlTopics = [
      // BEGINNER PHASE
      {
        roadmapId: mlRoadmap._id,
        title: 'Python Programming Essentials',
        description: 'Master Python from scratch - the primary language for ML.',
        phase: 'beginner',
        order: 1,
        estimatedHours: 25,
        icon: '🐍',
        keyPoints: ['Variables & data types', 'Functions & OOP', 'File handling', 'Best practices'],
        relatedProjects: [
          'Build a CLI calculator with memory functions',
          'Create a password manager with encryption',
          'Develop a web scraper for job listings',
          'Build a simple expense tracker',
          'Create a quiz game with scoring system'
        ],
        resources: [{ title: 'Python Official Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'documentation', platform: 'Python.org', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'NumPy for Numerical Computing',
        description: 'NumPy is the foundation of all scientific Python. Master arrays and vectorized operations.',
        phase: 'beginner',
        order: 2,
        estimatedHours: 15,
        icon: '🔢',
        keyPoints: ['Array creation & operations', 'Broadcasting', 'Linear algebra', 'Performance optimization'],
        relatedProjects: [
          'Implement matrix multiplication from scratch',
          'Build an image manipulation library (grayscale, blur)',
          'Create a simple neural network forward pass with NumPy',
          'Build a Monte Carlo simulation for Pi estimation',
          'Implement basic image filters (edge detection, sharpen)'
        ],
        resources: [{ title: 'NumPy Documentation', url: 'https://numpy.org/doc/', type: 'documentation', platform: 'NumPy', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Pandas for Data Manipulation',
        description: 'The most important tool for data scientists. Master DataFrames and data cleaning.',
        phase: 'beginner',
        order: 3,
        estimatedHours: 20,
        icon: '🐼',
        keyPoints: ['DataFrames & Series', 'Data cleaning', 'GroupBy operations', 'Merging & joining'],
        relatedProjects: [
          'Clean and analyze a messy real-world dataset',
          'Build an automated EDA pipeline',
          'Create a COVID-19 data analysis dashboard',
          'Analyze Netflix viewing history data',
          'Build a stock market data aggregator'
        ],
        resources: [{ title: 'Pandas Documentation', url: 'https://pandas.pydata.org/docs/', type: 'documentation', platform: 'Pandas', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Data Visualization Mastery',
        description: 'Communicate insights effectively with Matplotlib, Seaborn, and Plotly.',
        phase: 'beginner',
        order: 4,
        estimatedHours: 15,
        icon: '📊',
        keyPoints: ['Matplotlib fundamentals', 'Seaborn statistical plots', 'Plotly interactive charts', 'Best practices'],
        relatedProjects: [
          'Create a COVID-19 interactive dashboard',
          'Build an automated EDA visualization report',
          'Recreate famous infographics with Python',
          'Create a real-time cryptocurrency price tracker',
          'Build a weather data visualization app'
        ],
        resources: [{ title: 'Matplotlib Gallery', url: 'https://matplotlib.org/stable/gallery/', type: 'examples', platform: 'Matplotlib', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Mathematics for ML: Linear Algebra',
        description: 'The mathematical backbone of ML. Vectors, matrices, and transformations.',
        phase: 'beginner',
        order: 5,
        estimatedHours: 20,
        icon: '📐',
        keyPoints: ['Vectors & matrices', 'Eigenvalues & eigenvectors', 'SVD decomposition', 'Matrix factorization'],
        relatedProjects: [
          'Implement PCA from scratch using eigendecomposition',
          'Build an image compression tool using SVD',
          'Create a simple recommender using matrix factorization',
          'Visualize linear transformations interactively',
          'Build a face recognition system with Eigenfaces'
        ],
        resources: [{ title: '3Blue1Brown Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab', type: 'video', platform: 'YouTube', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Statistics & Probability',
        description: 'The language of uncertainty. Essential for ML models and data analysis.',
        phase: 'beginner',
        order: 6,
        estimatedHours: 25,
        icon: '🎲',
        keyPoints: ['Probability distributions', 'Hypothesis testing', 'Bayes theorem', 'Statistical inference'],
        relatedProjects: [
          'Build a Bayesian A/B testing framework',
          'Create a probability distribution visualizer',
          'Implement Monte Carlo simulations',
          'Build a spam classifier using Naive Bayes',
          'Create a statistical significance calculator'
        ],
        resources: [{ title: 'Statistics - Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course', platform: 'Khan Academy', isFree: true }]
      },

      // INTERMEDIATE PHASE
      {
        roadmapId: mlRoadmap._id,
        title: 'Introduction to Machine Learning',
        description: 'Understand ML fundamentals, types of learning, and the complete ML workflow.',
        phase: 'intermediate',
        order: 1,
        estimatedHours: 12,
        icon: '🎯',
        keyPoints: ['Supervised vs Unsupervised', 'Bias-variance tradeoff', 'Cross-validation', 'Model selection'],
        relatedProjects: [
          'Complete a Kaggle Getting Started competition',
          'Build an end-to-end ML pipeline template',
          'Create a model comparison framework',
          'Build a data preprocessing toolkit',
          'Implement cross-validation from scratch'
        ],
        resources: [{ title: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'course', platform: 'Google', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Linear & Logistic Regression',
        description: 'The foundational supervised learning algorithms. Regression and classification basics.',
        phase: 'intermediate',
        order: 2,
        estimatedHours: 18,
        icon: '📈',
        keyPoints: ['Cost functions', 'Gradient descent', 'Regularization (L1, L2)', 'Polynomial regression'],
        relatedProjects: [
          'Implement linear regression from scratch',
          'Build a house price predictor',
          'Create a customer churn prediction model',
          'Build a loan default classifier',
          'Implement logistic regression with regularization'
        ],
        resources: [{ title: 'StatQuest - Linear Regression', url: 'https://www.youtube.com/watch?v=nk2CQITm_eo', type: 'video', platform: 'YouTube', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Decision Trees & Random Forests',
        description: 'Powerful tree-based methods. Learn bagging and ensemble techniques.',
        phase: 'intermediate',
        order: 3,
        estimatedHours: 15,
        icon: '🌲',
        keyPoints: ['Gini impurity & entropy', 'Tree pruning', 'Random forests', 'Feature importance'],
        relatedProjects: [
          'Implement decision tree from scratch',
          'Build a credit scoring model',
          'Create a customer segmentation system',
          'Build a disease prediction model',
          'Feature importance analysis on real dataset'
        ],
        resources: [{ title: 'StatQuest - Decision Trees', url: 'https://www.youtube.com/watch?v=7VeUPuFGJHk', type: 'video', platform: 'YouTube', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Gradient Boosting (XGBoost, LightGBM)',
        description: 'State-of-the-art for tabular data. Win Kaggle competitions!',
        phase: 'intermediate',
        order: 4,
        estimatedHours: 18,
        icon: '🚀',
        keyPoints: ['Boosting vs Bagging', 'XGBoost features', 'LightGBM optimization', 'Hyperparameter tuning'],
        relatedProjects: [
          'Win a Kaggle tabular competition',
          'Build a fraud detection system',
          'Create a click-through rate predictor',
          'Build a sales forecasting model',
          'Compare XGBoost vs LightGBM vs CatBoost'
        ],
        resources: [{ title: 'XGBoost Documentation', url: 'https://xgboost.readthedocs.io/', type: 'documentation', platform: 'XGBoost', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Clustering & Dimensionality Reduction',
        description: 'Unsupervised learning: K-Means, DBSCAN, PCA, t-SNE, UMAP.',
        phase: 'intermediate',
        order: 5,
        estimatedHours: 15,
        icon: '🎨',
        keyPoints: ['K-Means clustering', 'DBSCAN', 'PCA', 't-SNE & UMAP'],
        relatedProjects: [
          'Implement K-Means from scratch',
          'Customer segmentation for e-commerce',
          'Image color quantization using clustering',
          'Visualize word embeddings with t-SNE',
          'Anomaly detection with DBSCAN'
        ],
        resources: [{ title: 'Scikit-learn Clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html', type: 'documentation', platform: 'Scikit-learn', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Feature Engineering',
        description: 'The art of creating features. Often more important than model selection.',
        phase: 'intermediate',
        order: 6,
        estimatedHours: 18,
        icon: '🔧',
        keyPoints: ['Feature scaling', 'Encoding categoricals', 'Feature selection', 'Handling missing data'],
        relatedProjects: [
          'Build an automated feature engineering pipeline',
          'Create a feature store for ML projects',
          'Kaggle feature engineering challenge',
          'Time series feature engineering toolkit',
          'NLP feature extraction library'
        ],
        resources: [{ title: 'Kaggle Feature Engineering', url: 'https://www.kaggle.com/learn/feature-engineering', type: 'course', platform: 'Kaggle', isFree: true }]
      },

      // ADVANCED PHASE
      {
        roadmapId: mlRoadmap._id,
        title: 'Neural Network Fundamentals',
        description: 'Understand how neural networks work from the ground up.',
        phase: 'advanced',
        order: 1,
        estimatedHours: 25,
        icon: '🧠',
        keyPoints: ['Perceptrons & MLPs', 'Backpropagation', 'Activation functions', 'Optimizers (SGD, Adam)'],
        relatedProjects: [
          'Implement a neural network from scratch (NumPy only)',
          'Build MNIST classifier without frameworks',
          'Visualize gradient flow and activations',
          'Create an interactive neural network playground',
          'Implement automatic differentiation'
        ],
        resources: [{ title: '3Blue1Brown Neural Networks', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi', type: 'video', platform: 'YouTube', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'TensorFlow & Keras',
        description: 'Google\'s deep learning framework. Build and deploy neural networks.',
        phase: 'advanced',
        order: 2,
        estimatedHours: 25,
        icon: '🔥',
        keyPoints: ['Tensors & operations', 'Keras Sequential & Functional API', 'Custom layers', 'tf.data pipelines'],
        relatedProjects: [
          'Build a multi-class image classifier',
          'Create a text sentiment analyzer',
          'Build a recommendation system',
          'Implement custom training loop',
          'Deploy model with TensorFlow Serving'
        ],
        resources: [{ title: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials', type: 'documentation', platform: 'TensorFlow', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'PyTorch Mastery',
        description: 'Facebook\'s dynamic deep learning framework. Preferred for research.',
        phase: 'advanced',
        order: 3,
        estimatedHours: 25,
        icon: '🔦',
        keyPoints: ['Tensors & autograd', 'nn.Module', 'DataLoader', 'GPU training'],
        relatedProjects: [
          'Implement ResNet from scratch in PyTorch',
          'Build a custom dataset pipeline',
          'Train on multiple GPUs with DDP',
          'Create a PyTorch Lightning project',
          'Build a model zoo with pretrained weights'
        ],
        resources: [{ title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'documentation', platform: 'PyTorch', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Convolutional Neural Networks (CNNs)',
        description: 'Master computer vision. Image classification to object detection.',
        phase: 'advanced',
        order: 4,
        estimatedHours: 30,
        icon: '👁️',
        keyPoints: ['Convolutions & pooling', 'ResNet, VGG, EfficientNet', 'Transfer learning', 'Object detection (YOLO)'],
        relatedProjects: [
          'Build an image classifier for custom dataset',
          'Create a real-time object detection app',
          'Build a face recognition system',
          'Medical image diagnosis model',
          'Image segmentation with U-Net'
        ],
        resources: [{ title: 'Stanford CS231n', url: 'https://cs231n.stanford.edu/', type: 'course', platform: 'Stanford', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Transformers & Attention',
        description: 'The architecture revolutionizing AI. Foundation of GPT, BERT, and modern NLP.',
        phase: 'advanced',
        order: 5,
        estimatedHours: 30,
        icon: '⚡',
        keyPoints: ['Self-attention mechanism', 'Multi-head attention', 'BERT & GPT', 'Hugging Face Transformers'],
        relatedProjects: [
          'Implement Transformer from scratch',
          'Fine-tune BERT for text classification',
          'Build a question-answering system',
          'Create a text summarization model',
          'Build a chatbot with GPT'
        ],
        resources: [{ title: 'Hugging Face Course', url: 'https://huggingface.co/course', type: 'course', platform: 'Hugging Face', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Natural Language Processing',
        description: 'Process and understand human language. From basic NLP to LLMs.',
        phase: 'advanced',
        order: 6,
        estimatedHours: 25,
        icon: '💬',
        keyPoints: ['Text preprocessing', 'Word embeddings', 'Sequence models', 'LLMs & RAG'],
        relatedProjects: [
          'Build a chatbot from scratch',
          'Create a document classification system',
          'Build a named entity recognition model',
          'Create a RAG-based Q&A system',
          'Build a semantic search engine'
        ],
        resources: [{ title: 'Stanford CS224N', url: 'https://web.stanford.edu/class/cs224n/', type: 'course', platform: 'Stanford', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'Generative AI & LLMs',
        description: 'Work with cutting-edge generative AI. Build applications with LLMs.',
        phase: 'advanced',
        order: 7,
        estimatedHours: 20,
        icon: '✨',
        keyPoints: ['Prompt engineering', 'RAG systems', 'Fine-tuning (LoRA)', 'LangChain'],
        relatedProjects: [
          'Build a RAG document Q&A system',
          'Create an AI agent with tools',
          'Fine-tune a small LLM on custom data',
          'Build an AI coding assistant',
          'Create a multi-modal AI app'
        ],
        resources: [{ title: 'LangChain Documentation', url: 'https://python.langchain.com/docs/', type: 'documentation', platform: 'LangChain', isFree: true }]
      },

      // INTERVIEW PHASE
      {
        roadmapId: mlRoadmap._id,
        title: 'MLOps & Model Deployment',
        description: 'Take ML from notebook to production. CI/CD for ML systems.',
        phase: 'interview',
        order: 1,
        estimatedHours: 25,
        icon: '🚀',
        keyPoints: ['Docker for ML', 'Model serving', 'MLflow & Kubeflow', 'Monitoring & drift detection'],
        relatedProjects: [
          'Deploy a model with FastAPI and Docker',
          'Set up ML pipeline with MLflow',
          'Build real-time ML serving system',
          'Create model monitoring dashboard',
          'Build a feature store'
        ],
        resources: [{ title: 'Made with ML', url: 'https://madewithml.com/', type: 'course', platform: 'Made with ML', isFree: true }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'ML System Design',
        description: 'Design end-to-end ML systems. Critical for senior roles.',
        phase: 'interview',
        order: 2,
        estimatedHours: 20,
        icon: '🏗️',
        keyPoints: ['Problem framing', 'Data pipelines', 'Model selection', 'Scaling & serving'],
        relatedProjects: [
          'Design a recommendation system (end-to-end)',
          'Design a fraud detection system',
          'Design a search ranking system',
          'Design an ad click prediction system',
          'Design a content moderation system'
        ],
        resources: [{ title: 'ML System Design Book', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/', type: 'book', platform: "O'Reilly", isFree: false }]
      },
      {
        roadmapId: mlRoadmap._id,
        title: 'ML Interview Preparation',
        description: 'Ace ML interviews. Theory, coding, and system design.',
        phase: 'interview',
        order: 3,
        estimatedHours: 30,
        icon: '💼',
        keyPoints: ['ML theory deep dive', 'Coding implementations', 'Case studies', 'Behavioral prep'],
        relatedProjects: [
          'Implement 10 ML algorithms from scratch',
          'Create ML flashcard study app',
          'Build mock interview practice tool',
          'Complete 50 LeetCode ML problems',
          'Portfolio of 5 production-ready projects'
        ],
        resources: [{ title: 'ML Interview GitHub', url: 'https://github.com/khangich/machine-learning-interview', type: 'repository', platform: 'GitHub', isFree: true }]
      }
    ];

    await Topic.insertMany(mlTopics);
    console.log(`✅ Created ${mlTopics.length} ML topics`);
    await Roadmap.findByIdAndUpdate(mlRoadmap._id, { totalTopics: mlTopics.length });

    // ==================== INTERVIEW QUESTIONS ====================
    console.log('❓ Creating Interview Questions...');

    const questions = [
      { roadmapId: mlRoadmap._id, question: 'What is the bias-variance tradeoff?', answer: 'Bias is error from oversimplified models (underfitting). Variance is error from models too sensitive to training data (overfitting). The tradeoff is finding the right model complexity.', difficulty: 'medium', category: 'ML Fundamentals', tags: ['bias', 'variance'] },
      { roadmapId: mlRoadmap._id, question: 'Explain gradient descent and its variants.', answer: 'Gradient descent optimizes parameters by moving in the direction of steepest descent. Variants: Batch GD (all data), SGD (one sample), Mini-batch GD (small batches). Adam combines momentum + RMSprop.', difficulty: 'medium', category: 'Optimization', tags: ['gradient-descent', 'adam'] },
      { roadmapId: mlRoadmap._id, question: 'What is regularization and why use it?', answer: 'Regularization adds a penalty to prevent overfitting. L1 (Lasso) adds |w| for sparsity. L2 (Ridge) adds w² to shrink weights. Elastic Net combines both.', difficulty: 'medium', category: 'ML Fundamentals', tags: ['regularization', 'l1', 'l2'] },
      { roadmapId: mlRoadmap._id, question: 'Explain precision, recall, and F1 score.', answer: 'Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2*(P*R)/(P+R). Use precision when FP costly, recall when FN costly, F1 for balance.', difficulty: 'easy', category: 'Model Evaluation', tags: ['metrics'] },
      { roadmapId: mlRoadmap._id, question: 'What is the difference between bagging and boosting?', answer: 'Bagging trains models in parallel on bootstrap samples, combines by averaging (Random Forest). Boosting trains sequentially, each fixing previous errors (XGBoost, AdaBoost).', difficulty: 'medium', category: 'Ensemble Methods', tags: ['bagging', 'boosting'] },
      { roadmapId: mlRoadmap._id, question: 'Explain backpropagation in neural networks.', answer: 'Backpropagation computes gradients of loss w.r.t weights using chain rule. Forward pass computes predictions, backward pass propagates gradients from output to input layers.', difficulty: 'hard', category: 'Deep Learning', tags: ['backpropagation'] },
      { roadmapId: mlRoadmap._id, question: 'What is the vanishing gradient problem?', answer: 'In deep networks, gradients become very small during backpropagation. Solutions: ReLU activation, batch normalization, residual connections (ResNet), proper initialization.', difficulty: 'hard', category: 'Deep Learning', tags: ['vanishing-gradient'] },
      { roadmapId: mlRoadmap._id, question: 'Explain the attention mechanism.', answer: 'Attention computes weighted sum of values based on query-key similarity: Attention(Q,K,V) = softmax(QK^T/√d)V. Enables models to focus on relevant parts of input.', difficulty: 'hard', category: 'Transformers', tags: ['attention'] },
      { roadmapId: mlRoadmap._id, question: 'How do you handle imbalanced datasets?', answer: 'Techniques: Resampling (SMOTE, undersampling), class weights, appropriate metrics (F1, AUC-PR), ensemble methods, anomaly detection approach for extreme imbalance.', difficulty: 'medium', category: 'Practical ML', tags: ['imbalanced-data'] },
      { roadmapId: mlRoadmap._id, question: 'What is model drift and how to detect it?', answer: 'Model drift is performance degradation over time due to data distribution changes. Detect via monitoring prediction distributions, statistical tests (KS, PSI), performance metrics.', difficulty: 'hard', category: 'MLOps', tags: ['model-drift'] },
      { roadmapId: mlRoadmap._id, question: 'Explain the difference between CNN and RNN.', answer: 'CNNs use convolutions for spatial data (images), capture local patterns with translation invariance. RNNs process sequential data with hidden state memory, handle variable-length sequences.', difficulty: 'medium', category: 'Deep Learning', tags: ['cnn', 'rnn'] },
      { roadmapId: mlRoadmap._id, question: 'What is dropout and why does it help?', answer: 'Dropout randomly zeros neuron activations during training (typically p=0.5). Prevents co-adaptation, acts as ensemble, provides regularization. At test time, scale weights by (1-p).', difficulty: 'medium', category: 'Deep Learning', tags: ['dropout'] },
    ];

    await InterviewQuestion.insertMany(questions);
    console.log(`✅ Created ${questions.length} interview questions`);
    await Roadmap.findByIdAndUpdate(mlRoadmap._id, { totalQuestions: questions.length });

    // ==================== CAREER INFO ====================
    console.log('💼 Creating Career Info...');

    const careers = [
      { roadmapId: mlRoadmap._id, jobTitle: 'Machine Learning Engineer', description: 'Build and deploy ML models in production.', salaryRange: { min: 1200000, max: 4500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Python', 'TensorFlow/PyTorch', 'Docker'], preferredSkills: ['Kubernetes', 'MLOps'], experienceLevel: 'junior', growthPath: ['ML Engineer', 'Senior ML Engineer', 'Staff ML Engineer'], companies: ['Google', 'Meta', 'Amazon'] },
      { roadmapId: mlRoadmap._id, jobTitle: 'Data Scientist', description: 'Extract insights and build predictive models.', salaryRange: { min: 800000, max: 3500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Python', 'Statistics', 'SQL'], preferredSkills: ['Deep learning', 'A/B testing'], experienceLevel: 'fresher', growthPath: ['Data Scientist', 'Senior DS', 'Lead DS'], companies: ['Google', 'Netflix', 'Uber'] },
      { roadmapId: mlRoadmap._id, jobTitle: 'Deep Learning Engineer', description: 'Specialize in neural networks for CV and NLP.', salaryRange: { min: 1500000, max: 6000000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['PyTorch', 'CNNs', 'Transformers'], preferredSkills: ['CUDA', 'Distributed training'], experienceLevel: 'mid', growthPath: ['DL Engineer', 'Senior DL Engineer', 'Research Scientist'], companies: ['NVIDIA', 'OpenAI', 'DeepMind'] },
      { roadmapId: mlRoadmap._id, jobTitle: 'MLOps Engineer', description: 'Build ML infrastructure and pipelines.', salaryRange: { min: 1200000, max: 4000000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Docker', 'Kubernetes', 'CI/CD'], preferredSkills: ['MLflow', 'Feature stores'], experienceLevel: 'junior', growthPath: ['MLOps Engineer', 'Senior MLOps', 'Platform Lead'], companies: ['All tech companies'] },
      { roadmapId: mlRoadmap._id, jobTitle: 'NLP Engineer', description: 'Build language understanding systems.', salaryRange: { min: 1300000, max: 5000000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Transformers', 'Hugging Face', 'Python'], preferredSkills: ['LLMs', 'RAG'], experienceLevel: 'mid', growthPath: ['NLP Engineer', 'Senior NLP', 'NLP Architect'], companies: ['OpenAI', 'Google', 'Anthropic'] },
    ];

    await CareerInfo.insertMany(careers);
    console.log(`✅ Created ${careers.length} career entries`);

    console.log('\n🎉 Machine Learning Roadmap seeded successfully!');
    console.log('==================================');
    console.log(`📚 Roadmap: 1`);
    console.log(`📖 Topics: ${mlTopics.length}`);
    console.log(`❓ Questions: ${questions.length}`);
    console.log(`💼 Careers: ${careers.length}`);
    console.log('==================================');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedMLRoadmap();
