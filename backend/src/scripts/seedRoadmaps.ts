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

async function seedDatabase() {
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
    console.log('✅ Cleared existing data');

    // Create roadmaps
    console.log('📚 Creating roadmaps...');
    const roadmapsData = [
      {
        title: 'Web Development',
        slug: 'web-development',
        description: 'Complete path to becoming a full-stack web developer',
        longDescription: 'Master HTML, CSS, JavaScript, React, Node.js, databases, and deployment. This comprehensive roadmap covers everything from basic web concepts to advanced full-stack development.',
        icon: '🌐',
        color: '#3B82F6',
        category: 'web',
        difficulty: 'all-levels',
        estimatedWeeks: 16,
        isPublished: true,
        isFeatured: true,
        prerequisites: ['Basic computer knowledge', 'Logical thinking'],
        outcomes: ['Build responsive websites', 'Create full-stack applications', 'Deploy to cloud platforms', 'Handle databases'],
        tags: ['html', 'css', 'javascript', 'react', 'nodejs', 'mongodb']
      },
      {
        title: 'Data Science',
        slug: 'data-science',
        description: 'Learn data analysis, visualization, and machine learning',
        longDescription: 'From Python basics to advanced ML models. Learn data manipulation with Pandas, visualization with Matplotlib, and build predictive models with Scikit-learn.',
        icon: '📊',
        color: '#10B981',
        category: 'data',
        difficulty: 'intermediate',
        estimatedWeeks: 20,
        isPublished: true,
        isFeatured: true,
        prerequisites: ['Basic programming', 'High school math'],
        outcomes: ['Analyze large datasets', 'Create data visualizations', 'Build ML models', 'Extract insights from data'],
        tags: ['python', 'pandas', 'numpy', 'matplotlib', 'scikit-learn', 'statistics']
      },
      {
        title: 'Machine Learning',
        slug: 'machine-learning',
        description: 'Deep dive into ML algorithms and neural networks',
        longDescription: 'Understand the math behind ML, implement algorithms from scratch, and build production-ready models with TensorFlow and PyTorch.',
        icon: '🤖',
        color: '#8B5CF6',
        category: 'ai-ml',
        difficulty: 'advanced',
        estimatedWeeks: 24,
        isPublished: true,
        isFeatured: true,
        prerequisites: ['Python programming', 'Linear algebra', 'Statistics'],
        outcomes: ['Implement ML algorithms', 'Build neural networks', 'Deploy ML models', 'Solve real-world problems'],
        tags: ['python', 'tensorflow', 'pytorch', 'deep-learning', 'neural-networks']
      },
      {
        title: 'SQL & Databases',
        slug: 'sql-databases',
        description: 'Master database design and SQL queries',
        longDescription: 'Learn relational database concepts, write complex SQL queries, design efficient schemas, and work with both SQL and NoSQL databases.',
        icon: '🗄️',
        color: '#F59E0B',
        category: 'database',
        difficulty: 'beginner',
        estimatedWeeks: 8,
        isPublished: true,
        isFeatured: false,
        prerequisites: ['Basic computer knowledge'],
        outcomes: ['Write complex SQL queries', 'Design database schemas', 'Optimize queries', 'Work with NoSQL'],
        tags: ['sql', 'mysql', 'postgresql', 'mongodb', 'database-design']
      },
      {
        title: 'DevOps',
        slug: 'devops',
        description: 'CI/CD, containerization, and cloud infrastructure',
        longDescription: 'Learn Docker, Kubernetes, CI/CD pipelines, cloud platforms (AWS/Azure/GCP), and infrastructure as code with Terraform.',
        icon: '⚙️',
        color: '#EF4444',
        category: 'devops',
        difficulty: 'intermediate',
        estimatedWeeks: 16,
        isPublished: true,
        isFeatured: false,
        prerequisites: ['Linux basics', 'Command line', 'Basic programming'],
        outcomes: ['Containerize applications', 'Set up CI/CD pipelines', 'Manage cloud infrastructure', 'Implement IaC'],
        tags: ['docker', 'kubernetes', 'aws', 'terraform', 'jenkins', 'github-actions']
      }
    ];

    const createdRoadmaps = await Roadmap.insertMany(roadmapsData);
    console.log(`✅ Created ${createdRoadmaps.length} roadmaps`);

    const webDev = createdRoadmaps[0];
    const dataScience = createdRoadmaps[1];
    const ml = createdRoadmaps[2];
    const sql = createdRoadmaps[3];
    const devOps = createdRoadmaps[4];

    // ==================== TOPICS ====================
    console.log('📖 Creating topics...');

    // Web Development Topics
    const webDevTopics = [
      { roadmapId: webDev._id, title: 'HTML Fundamentals', description: 'Learn the structure of web pages with HTML5', phase: 'beginner', order: 1, estimatedHours: 4, icon: '📄', keyPoints: ['HTML elements', 'Semantic HTML', 'Forms', 'Accessibility'], resources: [{ title: 'HTML Tutorial - W3Schools', url: 'https://www.w3schools.com/html/', type: 'tutorial', platform: 'W3Schools', isFree: true }] },
      { roadmapId: webDev._id, title: 'CSS Basics', description: 'Style your web pages with CSS', phase: 'beginner', order: 2, estimatedHours: 6, icon: '🎨', keyPoints: ['Selectors', 'Box model', 'Flexbox', 'Grid'], resources: [{ title: 'CSS Tutorial - MDN', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', type: 'documentation', platform: 'MDN', isFree: true }] },
      { roadmapId: webDev._id, title: 'JavaScript Basics', description: 'Add interactivity to your websites', phase: 'beginner', order: 3, estimatedHours: 10, icon: '⚡', keyPoints: ['Variables', 'Functions', 'DOM manipulation', 'Events'], resources: [{ title: 'JavaScript.info', url: 'https://javascript.info/', type: 'tutorial', platform: 'JavaScript.info', isFree: true }] },
      { roadmapId: webDev._id, title: 'React Fundamentals', description: 'Build modern UIs with React', phase: 'intermediate', order: 1, estimatedHours: 15, icon: '⚛️', keyPoints: ['Components', 'Props', 'State', 'Hooks'], resources: [{ title: 'React Official Docs', url: 'https://react.dev/', type: 'documentation', platform: 'React', isFree: true }] },
      { roadmapId: webDev._id, title: 'Node.js & Express', description: 'Build backend APIs with Node.js', phase: 'intermediate', order: 2, estimatedHours: 12, icon: '🚀', keyPoints: ['REST APIs', 'Middleware', 'Routing', 'Error handling'], resources: [] },
      { roadmapId: webDev._id, title: 'MongoDB', description: 'Work with NoSQL databases', phase: 'intermediate', order: 3, estimatedHours: 8, icon: '🍃', keyPoints: ['CRUD operations', 'Mongoose', 'Aggregation', 'Indexing'], resources: [] },
      { roadmapId: webDev._id, title: 'TypeScript', description: 'Add type safety to JavaScript', phase: 'advanced', order: 1, estimatedHours: 10, icon: '📘', keyPoints: ['Types', 'Interfaces', 'Generics', 'Type guards'], resources: [] },
      { roadmapId: webDev._id, title: 'Testing', description: 'Write tests for your applications', phase: 'advanced', order: 2, estimatedHours: 8, icon: '🧪', keyPoints: ['Unit testing', 'Integration testing', 'Jest', 'React Testing Library'], resources: [] },
      { roadmapId: webDev._id, title: 'Deployment & DevOps', description: 'Deploy your apps to production', phase: 'advanced', order: 3, estimatedHours: 6, icon: '☁️', keyPoints: ['Vercel', 'Docker basics', 'CI/CD', 'Environment variables'], resources: [] },
      { roadmapId: webDev._id, title: 'JavaScript Interview Prep', description: 'Prepare for JS technical interviews', phase: 'interview', order: 1, estimatedHours: 8, icon: '💼', keyPoints: ['Closures', 'Promises', 'Event loop', 'Prototypes'], resources: [] },
      { roadmapId: webDev._id, title: 'React Interview Prep', description: 'Master React interview questions', phase: 'interview', order: 2, estimatedHours: 6, icon: '💼', keyPoints: ['Virtual DOM', 'Hooks internals', 'Performance', 'State management'], resources: [] },
    ];

    // Data Science Topics
    const dataScienceTopics = [
      { roadmapId: dataScience._id, title: 'Python for Data Science', description: 'Master Python basics for data analysis', phase: 'beginner', order: 1, estimatedHours: 20, icon: '🐍', keyPoints: ['Python basics', 'Lists, Dicts, Sets', 'Functions & Classes', 'File handling'], resources: [{ title: 'Python.org Tutorial', type: 'documentation', url: 'https://docs.python.org/3/tutorial/' }] },
      { roadmapId: dataScience._id, title: 'Statistics & Probability', description: 'Foundation of statistical concepts', phase: 'beginner', order: 2, estimatedHours: 25, icon: '📊', keyPoints: ['Descriptive statistics', 'Probability distributions', 'Hypothesis testing', 'Confidence intervals'], resources: [] },
      { roadmapId: dataScience._id, title: 'Linear Algebra Basics', description: 'Matrix operations and vector spaces', phase: 'beginner', order: 3, estimatedHours: 15, icon: '🔢', keyPoints: ['Vectors', 'Matrix operations', 'Eigenvalues', 'Linear transformations'], resources: [] },
      { roadmapId: dataScience._id, title: 'NumPy Mastery', description: 'Numerical computing with arrays', phase: 'beginner', order: 4, estimatedHours: 10, icon: '🔵', keyPoints: ['Arrays', 'Broadcasting', 'Vectorization', 'Linear algebra ops'], resources: [] },
      { roadmapId: dataScience._id, title: 'Pandas for Data Analysis', description: 'Data manipulation and cleaning', phase: 'intermediate', order: 1, estimatedHours: 20, icon: '🐼', keyPoints: ['DataFrames', 'Data cleaning', 'GroupBy', 'Merging/Joining'], resources: [] },
      { roadmapId: dataScience._id, title: 'Data Visualization', description: 'Create compelling visualizations', phase: 'intermediate', order: 2, estimatedHours: 15, icon: '📈', keyPoints: ['Matplotlib', 'Seaborn', 'Plotly', 'Dashboard basics'], resources: [] },
      { roadmapId: dataScience._id, title: 'SQL for Data Science', description: 'Query databases with SQL', phase: 'intermediate', order: 3, estimatedHours: 18, icon: '🗄️', keyPoints: ['SELECT queries', 'JOINs', 'Aggregations', 'Window functions'], resources: [] },
      { roadmapId: dataScience._id, title: 'Exploratory Data Analysis', description: 'Techniques for exploring datasets', phase: 'intermediate', order: 4, estimatedHours: 15, icon: '🔍', keyPoints: ['Data profiling', 'Univariate analysis', 'Bivariate analysis', 'Outlier detection'], resources: [] },
      { roadmapId: dataScience._id, title: 'Feature Engineering', description: 'Create better features for models', phase: 'intermediate', order: 5, estimatedHours: 15, icon: '⚙️', keyPoints: ['Feature creation', 'Encoding categorical', 'Scaling', 'Feature selection'], resources: [] },
      { roadmapId: dataScience._id, title: 'Machine Learning Algorithms', description: 'Core ML algorithms', phase: 'advanced', order: 1, estimatedHours: 25, icon: '🤖', keyPoints: ['Linear/Logistic regression', 'Decision trees', 'Random forests', 'SVM'], resources: [] },
      { roadmapId: dataScience._id, title: 'Time Series Analysis', description: 'Analyze time-dependent data', phase: 'advanced', order: 2, estimatedHours: 18, icon: '⏰', keyPoints: ['Trend & Seasonality', 'ARIMA models', 'Prophet', 'Forecasting'], resources: [] },
      { roadmapId: dataScience._id, title: 'A/B Testing', description: 'Design and analyze experiments', phase: 'advanced', order: 3, estimatedHours: 12, icon: '🧪', keyPoints: ['Hypothesis formulation', 'Sample size', 'Statistical significance', 'Causal inference'], resources: [] },
      { roadmapId: dataScience._id, title: 'Big Data Tools', description: 'Work with large-scale data', phase: 'advanced', order: 4, estimatedHours: 20, icon: '💾', keyPoints: ['PySpark', 'Spark DataFrames', 'Distributed computing', 'Data pipelines'], resources: [] },
      { roadmapId: dataScience._id, title: 'Statistics Interview Prep', description: 'Prepare for stats questions', phase: 'interview', order: 1, estimatedHours: 10, icon: '📊', keyPoints: ['Probability puzzles', 'A/B testing questions', 'Statistical inference'], resources: [] },
      { roadmapId: dataScience._id, title: 'SQL Interview Prep', description: 'Master SQL interview problems', phase: 'interview', order: 2, estimatedHours: 12, icon: '🗄️', keyPoints: ['Complex JOINs', 'Window functions', 'Query optimization'], resources: [] },
      { roadmapId: dataScience._id, title: 'Case Study Practice', description: 'Solve business case studies', phase: 'interview', order: 3, estimatedHours: 15, icon: '💼', keyPoints: ['Problem framing', 'Metric selection', 'Analysis approach'], resources: [] },
    ];

    // Machine Learning Topics
    const mlTopics = [
      { roadmapId: ml._id, title: 'Python for ML', description: 'Master Python fundamentals for machine learning', phase: 'beginner', order: 1, estimatedHours: 15, icon: '🐍', keyPoints: ['Python basics', 'NumPy', 'Pandas', 'Data manipulation'], resources: [] },
      { roadmapId: ml._id, title: 'Mathematics for ML', description: 'Essential math - Linear Algebra, Calculus, Statistics', phase: 'beginner', order: 2, estimatedHours: 20, icon: '📐', keyPoints: ['Linear algebra', 'Calculus', 'Probability', 'Statistics'], resources: [] },
      { roadmapId: ml._id, title: 'Data Visualization', description: 'Visualize data with Matplotlib and Seaborn', phase: 'beginner', order: 3, estimatedHours: 8, icon: '📊', keyPoints: ['Matplotlib', 'Seaborn', 'Plotly', 'Data storytelling'], resources: [] },
      { roadmapId: ml._id, title: 'Supervised Learning', description: 'Classification and Regression algorithms', phase: 'intermediate', order: 1, estimatedHours: 25, icon: '🎯', keyPoints: ['Linear Regression', 'Logistic Regression', 'Decision Trees', 'SVM', 'KNN'], resources: [] },
      { roadmapId: ml._id, title: 'Unsupervised Learning', description: 'Clustering and Dimensionality Reduction', phase: 'intermediate', order: 2, estimatedHours: 15, icon: '🔮', keyPoints: ['K-Means', 'Hierarchical Clustering', 'PCA', 'DBSCAN'], resources: [] },
      { roadmapId: ml._id, title: 'Model Evaluation', description: 'Metrics and Hyperparameter Tuning', phase: 'intermediate', order: 3, estimatedHours: 10, icon: '📈', keyPoints: ['Accuracy', 'Precision/Recall', 'F1 Score', 'ROC-AUC', 'Cross-validation'], resources: [] },
      { roadmapId: ml._id, title: 'Feature Engineering', description: 'Transform raw data into features', phase: 'intermediate', order: 4, estimatedHours: 12, icon: '🔧', keyPoints: ['Feature scaling', 'Encoding', 'Feature selection', 'Handling missing data'], resources: [] },
      { roadmapId: ml._id, title: 'Deep Learning Fundamentals', description: 'Neural Networks and Backpropagation', phase: 'advanced', order: 1, estimatedHours: 30, icon: '🧠', keyPoints: ['Perceptrons', 'Activation functions', 'Backpropagation', 'Gradient descent'], resources: [] },
      { roadmapId: ml._id, title: 'TensorFlow & Keras', description: 'Build neural networks with TensorFlow', phase: 'advanced', order: 2, estimatedHours: 20, icon: '🔥', keyPoints: ['Tensors', 'Keras Sequential API', 'Custom layers', 'Model training'], resources: [] },
      { roadmapId: ml._id, title: 'PyTorch', description: 'Dynamic neural networks with PyTorch', phase: 'advanced', order: 3, estimatedHours: 20, icon: '🔦', keyPoints: ['Tensors', 'Autograd', 'nn.Module', 'DataLoaders'], resources: [] },
      { roadmapId: ml._id, title: 'CNNs for Computer Vision', description: 'Convolutional Neural Networks', phase: 'advanced', order: 4, estimatedHours: 25, icon: '👁️', keyPoints: ['Convolutions', 'Pooling', 'ResNet', 'Transfer Learning'], resources: [] },
      { roadmapId: ml._id, title: 'RNNs & Transformers', description: 'Sequence models and attention', phase: 'advanced', order: 5, estimatedHours: 25, icon: '🔄', keyPoints: ['RNN', 'LSTM', 'GRU', 'Attention', 'Transformers'], resources: [] },
      { roadmapId: ml._id, title: 'MLOps & Deployment', description: 'Deploy ML models to production', phase: 'advanced', order: 6, estimatedHours: 15, icon: '🚀', keyPoints: ['Model serialization', 'Flask/FastAPI', 'Docker', 'Cloud deployment'], resources: [] },
      { roadmapId: ml._id, title: 'ML Theory Interview', description: 'Prepare for ML theory questions', phase: 'interview', order: 1, estimatedHours: 12, icon: '💼', keyPoints: ['Bias-Variance tradeoff', 'Regularization', 'Overfitting', 'Loss functions'], resources: [] },
      { roadmapId: ml._id, title: 'ML Coding Interview', description: 'Implement ML algorithms from scratch', phase: 'interview', order: 2, estimatedHours: 15, icon: '💻', keyPoints: ['Linear Regression from scratch', 'Gradient Descent', 'K-Means implementation'], resources: [] },
      { roadmapId: ml._id, title: 'ML System Design', description: 'Design end-to-end ML systems', phase: 'interview', order: 3, estimatedHours: 10, icon: '🏗️', keyPoints: ['Problem framing', 'Data pipeline', 'Model selection', 'Deployment'], resources: [] },
    ];

    // SQL Topics
    const sqlTopics = [
      { roadmapId: sql._id, title: 'SQL Basics', description: 'Learn fundamental SQL commands', phase: 'beginner', order: 1, estimatedHours: 15, icon: '📝', keyPoints: ['SELECT statements', 'WHERE clause', 'ORDER BY', 'INSERT/UPDATE/DELETE'], resources: [] },
      { roadmapId: sql._id, title: 'Database Design', description: 'Design efficient databases', phase: 'beginner', order: 2, estimatedHours: 12, icon: '📐', keyPoints: ['ER diagrams', 'Normalization', 'Primary & Foreign keys', 'Relationships'], resources: [] },
      { roadmapId: sql._id, title: 'JOINs Mastery', description: 'Master all types of SQL JOINs', phase: 'beginner', order: 3, estimatedHours: 10, icon: '🔗', keyPoints: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'FULL OUTER JOIN', 'Self JOIN'], resources: [] },
      { roadmapId: sql._id, title: 'Aggregations & Grouping', description: 'Summarize data with GROUP BY', phase: 'intermediate', order: 1, estimatedHours: 10, icon: '📊', keyPoints: ['COUNT, SUM, AVG', 'GROUP BY', 'HAVING clause', 'ROLLUP'], resources: [] },
      { roadmapId: sql._id, title: 'Subqueries & CTEs', description: 'Write complex queries', phase: 'intermediate', order: 2, estimatedHours: 12, icon: '🔄', keyPoints: ['Scalar subqueries', 'Correlated subqueries', 'Common Table Expressions', 'Recursive CTEs'], resources: [] },
      { roadmapId: sql._id, title: 'Window Functions', description: 'Advanced analytics', phase: 'intermediate', order: 3, estimatedHours: 15, icon: '🪟', keyPoints: ['ROW_NUMBER', 'RANK/DENSE_RANK', 'LAG/LEAD', 'Running totals'], resources: [] },
      { roadmapId: sql._id, title: 'Indexing & Performance', description: 'Optimize query performance', phase: 'intermediate', order: 4, estimatedHours: 12, icon: '⚡', keyPoints: ['Index types', 'B-tree indexes', 'EXPLAIN plans', 'Query optimization'], resources: [] },
      { roadmapId: sql._id, title: 'Stored Procedures', description: 'Create reusable database code', phase: 'advanced', order: 1, estimatedHours: 12, icon: '⚙️', keyPoints: ['Stored procedures', 'User-defined functions', 'Triggers', 'Error handling'], resources: [] },
      { roadmapId: sql._id, title: 'Transactions & ACID', description: 'Understand database transactions', phase: 'advanced', order: 2, estimatedHours: 10, icon: '🔐', keyPoints: ['ACID properties', 'Isolation levels', 'Deadlocks', 'Locking'], resources: [] },
      { roadmapId: sql._id, title: 'NoSQL Databases', description: 'Work with MongoDB and Redis', phase: 'advanced', order: 3, estimatedHours: 18, icon: '🍃', keyPoints: ['Document databases', 'Key-value stores', 'When to use NoSQL', 'CAP theorem'], resources: [] },
      { roadmapId: sql._id, title: 'Database Administration', description: 'Basic DBA tasks', phase: 'advanced', order: 4, estimatedHours: 15, icon: '🛠️', keyPoints: ['Backup & Recovery', 'User management', 'Monitoring', 'Replication'], resources: [] },
      { roadmapId: sql._id, title: 'SQL Interview Questions', description: 'Practice SQL interview problems', phase: 'interview', order: 1, estimatedHours: 15, icon: '💼', keyPoints: ['LeetCode SQL', 'Window function problems', 'Complex JOINs'], resources: [] },
      { roadmapId: sql._id, title: 'Database Design Interview', description: 'Schema design questions', phase: 'interview', order: 2, estimatedHours: 10, icon: '📐', keyPoints: ['Design scenarios', 'Normalization decisions', 'Trade-offs'], resources: [] },
    ];

    // DevOps Topics
    const devOpsTopics = [
      { roadmapId: devOps._id, title: 'Linux Fundamentals', description: 'Master Linux command line', phase: 'beginner', order: 1, estimatedHours: 25, icon: '🐧', keyPoints: ['File system', 'User management', 'Permissions', 'Process management'], resources: [] },
      { roadmapId: devOps._id, title: 'Networking Basics', description: 'Understand networking concepts', phase: 'beginner', order: 2, estimatedHours: 15, icon: '🌐', keyPoints: ['TCP/IP', 'DNS', 'HTTP/HTTPS', 'Load balancing'], resources: [] },
      { roadmapId: devOps._id, title: 'Version Control with Git', description: 'Advanced Git workflows', phase: 'beginner', order: 3, estimatedHours: 10, icon: '📚', keyPoints: ['Branching strategies', 'Git flow', 'Merge vs Rebase', 'Hooks'], resources: [] },
      { roadmapId: devOps._id, title: 'Shell Scripting', description: 'Automate tasks with Bash', phase: 'beginner', order: 4, estimatedHours: 15, icon: '📜', keyPoints: ['Variables', 'Control structures', 'Functions', 'Cron jobs'], resources: [] },
      { roadmapId: devOps._id, title: 'Docker & Containerization', description: 'Build and manage containers', phase: 'intermediate', order: 1, estimatedHours: 20, icon: '🐳', keyPoints: ['Dockerfile', 'Images & Containers', 'Volumes', 'Docker Compose'], resources: [] },
      { roadmapId: devOps._id, title: 'CI/CD Pipelines', description: 'Continuous integration and delivery', phase: 'intermediate', order: 2, estimatedHours: 18, icon: '🔄', keyPoints: ['GitHub Actions', 'Jenkins', 'GitLab CI', 'Pipeline design'], resources: [] },
      { roadmapId: devOps._id, title: 'Infrastructure as Code', description: 'Manage infrastructure with code', phase: 'intermediate', order: 3, estimatedHours: 22, icon: '📝', keyPoints: ['Terraform basics', 'Ansible playbooks', 'State management', 'Modules'], resources: [] },
      { roadmapId: devOps._id, title: 'Cloud Platforms', description: 'AWS/Azure/GCP fundamentals', phase: 'intermediate', order: 4, estimatedHours: 30, icon: '☁️', keyPoints: ['Compute', 'Storage', 'Networking', 'IAM', 'Serverless'], resources: [] },
      { roadmapId: devOps._id, title: 'Kubernetes', description: 'Container orchestration at scale', phase: 'advanced', order: 1, estimatedHours: 30, icon: '☸️', keyPoints: ['Pods & Deployments', 'Services', 'ConfigMaps', 'Ingress', 'Helm'], resources: [] },
      { roadmapId: devOps._id, title: 'Monitoring & Observability', description: 'Implement monitoring solutions', phase: 'advanced', order: 2, estimatedHours: 18, icon: '📊', keyPoints: ['Prometheus', 'Grafana', 'ELK Stack', 'Distributed tracing'], resources: [] },
      { roadmapId: devOps._id, title: 'Security & Compliance', description: 'DevSecOps practices', phase: 'advanced', order: 3, estimatedHours: 15, icon: '🔒', keyPoints: ['Secret management', 'Container security', 'SAST/DAST', 'Compliance'], resources: [] },
      { roadmapId: devOps._id, title: 'Site Reliability Engineering', description: 'SRE principles and practices', phase: 'advanced', order: 4, estimatedHours: 15, icon: '🛡️', keyPoints: ['Error budgets', 'Incident management', 'Chaos engineering', 'Postmortems'], resources: [] },
      { roadmapId: devOps._id, title: 'DevOps Interview Prep', description: 'Prepare for DevOps interviews', phase: 'interview', order: 1, estimatedHours: 12, icon: '💼', keyPoints: ['System design', 'Troubleshooting', 'Tool-specific questions'], resources: [] },
      { roadmapId: devOps._id, title: 'Hands-on Projects', description: 'Build real-world projects', phase: 'interview', order: 2, estimatedHours: 20, icon: '🔧', keyPoints: ['CI/CD pipeline project', 'K8s deployment', 'Monitoring setup'], resources: [] },
    ];

    const allTopics = [...webDevTopics, ...dataScienceTopics, ...mlTopics, ...sqlTopics, ...devOpsTopics];
    await Topic.insertMany(allTopics);
    console.log(`✅ Created ${allTopics.length} topics`);

    // Update roadmap topic counts
    await Roadmap.findByIdAndUpdate(webDev._id, { totalTopics: webDevTopics.length });
    await Roadmap.findByIdAndUpdate(dataScience._id, { totalTopics: dataScienceTopics.length });
    await Roadmap.findByIdAndUpdate(ml._id, { totalTopics: mlTopics.length });
    await Roadmap.findByIdAndUpdate(sql._id, { totalTopics: sqlTopics.length });
    await Roadmap.findByIdAndUpdate(devOps._id, { totalTopics: devOpsTopics.length });

    // ==================== INTERVIEW QUESTIONS ====================
    console.log('❓ Creating interview questions...');

    const questions = [
      // Web Development
      { roadmapId: webDev._id, question: 'What is the difference between let, const, and var?', answer: 'var is function-scoped and hoisted, let and const are block-scoped. const cannot be reassigned.', difficulty: 'easy', category: 'JavaScript', tags: ['javascript', 'variables'] },
      { roadmapId: webDev._id, question: 'Explain closures in JavaScript', answer: 'A closure is a function that has access to variables in its outer scope, even after the outer function has returned.', difficulty: 'medium', category: 'JavaScript', tags: ['javascript', 'closures'] },
      { roadmapId: webDev._id, question: 'What is the Virtual DOM in React?', answer: 'The Virtual DOM is a lightweight copy of the actual DOM. React uses it to efficiently update only the parts of the UI that changed.', difficulty: 'easy', category: 'React', tags: ['react', 'virtual-dom'] },
      { roadmapId: webDev._id, question: 'Explain the useEffect hook', answer: 'useEffect is used for side effects in functional components - data fetching, subscriptions, DOM mutations. It runs after render.', difficulty: 'medium', category: 'React', tags: ['react', 'hooks'] },
      { roadmapId: webDev._id, question: 'What is event bubbling?', answer: 'Event bubbling is when an event triggers on a nested element and propagates up to parent elements.', difficulty: 'easy', category: 'JavaScript', tags: ['javascript', 'events'] },

      // Data Science
      { roadmapId: dataScience._id, question: 'Explain the Central Limit Theorem', answer: 'CLT states that the sampling distribution of the sample mean approaches a normal distribution as sample size increases, regardless of the populations distribution.', difficulty: 'medium', category: 'Statistics', tags: ['statistics', 'probability'] },
      { roadmapId: dataScience._id, question: 'What is p-value and how do you interpret it?', answer: 'P-value is the probability of observing results at least as extreme as the measured results, assuming the null hypothesis is true. If p < alpha (usually 0.05), reject null hypothesis.', difficulty: 'medium', category: 'Statistics', tags: ['statistics', 'hypothesis-testing'] },
      { roadmapId: dataScience._id, question: 'How would you handle missing data?', answer: 'Options: 1) Delete rows, 2) Mean/Median/Mode imputation, 3) Forward/Backward fill for time series, 4) KNN imputation, 5) Model-based imputation (MICE), 6) Create missing indicator feature.', difficulty: 'medium', category: 'Data Handling', tags: ['data-cleaning', 'missing-data'] },
      { roadmapId: dataScience._id, question: 'How do you design an A/B test?', answer: '1) Define hypothesis and metrics, 2) Calculate required sample size, 3) Randomize users, 4) Run for adequate duration, 5) Analyze with statistical tests, 6) Consider practical vs statistical significance.', difficulty: 'hard', category: 'Experimentation', tags: ['ab-testing'] },
      { roadmapId: dataScience._id, question: 'Write SQL to find the second highest salary', answer: 'SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); Or use DENSE_RANK() window function.', difficulty: 'medium', category: 'SQL', tags: ['sql'] },

      // Machine Learning
      { roadmapId: ml._id, question: 'What is the bias-variance tradeoff?', answer: 'Bias is error from oversimplified models (underfitting). Variance is error from models too sensitive to training data (overfitting). The tradeoff is finding the right model complexity.', difficulty: 'medium', category: 'ML Theory', tags: ['machine-learning', 'bias-variance'] },
      { roadmapId: ml._id, question: 'Explain the difference between L1 and L2 regularization', answer: 'L1 (Lasso) adds absolute value of weights to loss, leading to sparse models. L2 (Ridge) adds squared weights, shrinking all weights. L1 is better for feature selection.', difficulty: 'medium', category: 'ML Theory', tags: ['regularization'] },
      { roadmapId: ml._id, question: 'What is gradient descent and its variants?', answer: 'Gradient descent optimizes model parameters by moving in the direction of steepest descent. Variants: Batch GD, Stochastic GD, Mini-batch GD. Adam, RMSprop are adaptive variants.', difficulty: 'medium', category: 'Optimization', tags: ['gradient-descent'] },
      { roadmapId: ml._id, question: 'How do you handle imbalanced datasets?', answer: 'Techniques: 1) Resampling, 2) SMOTE, 3) Class weights, 4) Ensemble methods, 5) Anomaly detection approach, 6) Using appropriate metrics (F1, AUC-ROC).', difficulty: 'medium', category: 'Data Handling', tags: ['imbalanced-data'] },
      { roadmapId: ml._id, question: 'What is the vanishing gradient problem?', answer: 'In deep networks, gradients become extremely small during backpropagation, causing early layers to learn slowly. Solutions: ReLU, batch normalization, residual connections.', difficulty: 'hard', category: 'Deep Learning', tags: ['deep-learning'] },
      { roadmapId: ml._id, question: 'Explain how Transformers work', answer: 'Transformers use self-attention to process sequences in parallel. Key components: Multi-head attention, positional encoding, feedforward layers. Enables capturing long-range dependencies.', difficulty: 'hard', category: 'Deep Learning', tags: ['transformers'] },
      { roadmapId: ml._id, question: 'What are precision, recall, and F1 score?', answer: 'Precision = TP/(TP+FP), Recall = TP/(TP+FN), F1 = 2*(P*R)/(P+R). Use precision when false positives costly, recall when false negatives costly.', difficulty: 'easy', category: 'Model Evaluation', tags: ['metrics'] },

      // SQL
      { roadmapId: sql._id, question: 'Explain the difference between WHERE and HAVING', answer: 'WHERE filters rows before grouping. HAVING filters groups after GROUP BY - works on aggregated values. Cant use aggregate functions in WHERE.', difficulty: 'easy', category: 'SQL Basics', tags: ['sql'] },
      { roadmapId: sql._id, question: 'Write a query to find employees earning more than their manager', answer: 'SELECT e.name FROM employees e JOIN employees m ON e.manager_id = m.id WHERE e.salary > m.salary; This is a self-join.', difficulty: 'medium', category: 'JOINs', tags: ['sql', 'self-join'] },
      { roadmapId: sql._id, question: 'Explain different types of indexes', answer: 'B-tree: default, good for equality and range. Hash: exact matches only. Covering: includes all query columns. Composite: multi-column, order matters.', difficulty: 'medium', category: 'Performance', tags: ['indexes'] },
      { roadmapId: sql._id, question: 'What is the difference between UNION and UNION ALL?', answer: 'UNION combines results and removes duplicates (slower). UNION ALL keeps all rows including duplicates (faster).', difficulty: 'easy', category: 'SQL Basics', tags: ['sql'] },
      { roadmapId: sql._id, question: 'Write a query using window functions for running total', answer: 'SELECT date, amount, SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total FROM transactions;', difficulty: 'medium', category: 'Window Functions', tags: ['sql', 'window-functions'] },
      { roadmapId: sql._id, question: 'How do you optimize a slow query?', answer: '1) EXPLAIN to see execution plan, 2) Check index usage, 3) Add indexes, 4) Rewrite query, 5) Limit result set, 6) Check for N+1 queries, 7) Consider caching.', difficulty: 'hard', category: 'Performance', tags: ['optimization'] },

      // DevOps
      { roadmapId: devOps._id, question: 'Explain the difference between Docker and Kubernetes', answer: 'Docker is a containerization platform - packages apps into containers. Kubernetes is an orchestration platform - manages, scales, and deploys containers across clusters.', difficulty: 'easy', category: 'Containers', tags: ['docker', 'kubernetes'] },
      { roadmapId: devOps._id, question: 'What is Infrastructure as Code?', answer: 'IaC manages infrastructure through code files. Benefits: version control, reproducibility, consistency, automation. Tools: Terraform, Ansible, CloudFormation.', difficulty: 'easy', category: 'IaC', tags: ['terraform'] },
      { roadmapId: devOps._id, question: 'Design a CI/CD pipeline for microservices', answer: 'Stages: 1) Code commit triggers, 2) Build & unit tests, 3) Static analysis, 4) Build Docker images, 5) Push to registry, 6) Deploy to staging, 7) Integration tests, 8) Deploy to production.', difficulty: 'hard', category: 'CI/CD', tags: ['cicd'] },
      { roadmapId: devOps._id, question: 'How would you handle a production incident?', answer: '1) Acknowledge and communicate, 2) Assess impact, 3) Mitigate/rollback, 4) Debug with logs/metrics, 5) Implement fix, 6) Verify resolution, 7) Blameless postmortem.', difficulty: 'medium', category: 'SRE', tags: ['incident-management'] },
      { roadmapId: devOps._id, question: 'Explain Kubernetes deployments, services, and ingress', answer: 'Deployment: manages ReplicaSets, handles rollouts. Service: stable network endpoint for pods. Ingress: HTTP/S routing from outside cluster, SSL termination.', difficulty: 'medium', category: 'Kubernetes', tags: ['kubernetes'] },
      { roadmapId: devOps._id, question: 'What is GitOps?', answer: 'GitOps uses Git as single source of truth for infrastructure and apps. Changes via pull requests, automated reconciliation. Tools: ArgoCD, Flux.', difficulty: 'medium', category: 'CI/CD', tags: ['gitops'] },
    ];

    await InterviewQuestion.insertMany(questions);
    console.log(`✅ Created ${questions.length} interview questions`);

    // Update question counts
    await Roadmap.findByIdAndUpdate(webDev._id, { totalQuestions: 5 });
    await Roadmap.findByIdAndUpdate(dataScience._id, { totalQuestions: 5 });
    await Roadmap.findByIdAndUpdate(ml._id, { totalQuestions: 7 });
    await Roadmap.findByIdAndUpdate(sql._id, { totalQuestions: 6 });
    await Roadmap.findByIdAndUpdate(devOps._id, { totalQuestions: 6 });

    // ==================== CAREER INFO ====================
    console.log('💼 Creating career info...');

    const careers = [
      // Web Development
      { roadmapId: webDev._id, jobTitle: 'Frontend Developer', description: 'Build user interfaces and client-side applications', salaryRange: { min: 400000, max: 1500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React'], preferredSkills: ['TypeScript', 'Testing'], experienceLevel: 'fresher', growthPath: ['Junior Dev', 'Mid Dev', 'Senior Dev', 'Lead', 'Architect'], companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Flipkart'] },
      { roadmapId: webDev._id, jobTitle: 'Full Stack Developer', description: 'Work on both frontend and backend', salaryRange: { min: 600000, max: 2500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], preferredSkills: ['TypeScript', 'AWS', 'Docker'], experienceLevel: 'junior', growthPath: ['Full Stack Dev', 'Senior Dev', 'Tech Lead', 'Engineering Manager'], companies: ['Startups', 'Product companies'] },
      { roadmapId: webDev._id, jobTitle: 'Backend Developer', description: 'Build APIs and server-side applications', salaryRange: { min: 500000, max: 2000000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['Node.js', 'Databases', 'REST APIs'], preferredSkills: ['Microservices', 'Message queues'], experienceLevel: 'junior', growthPath: ['Backend Dev', 'Senior Dev', 'Staff Engineer'], companies: ['Tech giants', 'Fintech'] },

      // Data Science
      { roadmapId: dataScience._id, jobTitle: 'Data Analyst', description: 'Analyze data to provide business insights', salaryRange: { min: 400000, max: 1200000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['SQL', 'Excel', 'Data visualization', 'Statistics'], preferredSkills: ['Python', 'Tableau/PowerBI'], experienceLevel: 'fresher', growthPath: ['Data Analyst', 'Senior Analyst', 'Lead Analyst', 'Analytics Manager'], companies: ['Amazon', 'Flipkart', 'Paytm'] },
      { roadmapId: dataScience._id, jobTitle: 'Data Scientist', description: 'Build predictive models and derive insights', salaryRange: { min: 600000, max: 2500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Python', 'Statistics', 'ML algorithms', 'SQL'], preferredSkills: ['Deep learning', 'A/B testing'], experienceLevel: 'junior', growthPath: ['Data Scientist', 'Senior DS', 'Lead DS', 'Head of Data Science'], companies: ['Google', 'Amazon', 'Microsoft'] },
      { roadmapId: dataScience._id, jobTitle: 'Analytics Engineer', description: 'Build data pipelines and infrastructure', salaryRange: { min: 800000, max: 2200000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['SQL', 'Python', 'dbt', 'Data warehousing'], preferredSkills: ['Airflow', 'Spark'], experienceLevel: 'junior', growthPath: ['Analytics Engineer', 'Senior AE', 'Data Platform Lead'], companies: ['Tech companies', 'Data startups'] },
      { roadmapId: dataScience._id, jobTitle: 'BI Developer', description: 'Create dashboards and reports', salaryRange: { min: 500000, max: 1500000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['SQL', 'Tableau/PowerBI', 'Data modeling'], preferredSkills: ['Python', 'ETL tools'], experienceLevel: 'fresher', growthPath: ['BI Developer', 'Senior BI Dev', 'BI Architect'], companies: ['Consulting firms', 'Enterprises'] },

      // Machine Learning
      { roadmapId: ml._id, jobTitle: 'Machine Learning Engineer', description: 'Build and deploy ML models in production', salaryRange: { min: 800000, max: 3500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Python', 'TensorFlow/PyTorch', 'Scikit-learn', 'MLOps'], preferredSkills: ['Kubernetes', 'Spark'], experienceLevel: 'junior', growthPath: ['ML Engineer', 'Senior ML Engineer', 'Staff ML Engineer', 'ML Architect'], companies: ['Google', 'Meta', 'Amazon', 'OpenAI'] },
      { roadmapId: ml._id, jobTitle: 'Deep Learning Engineer', description: 'Develop neural network models', salaryRange: { min: 1200000, max: 5000000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['Python', 'TensorFlow/PyTorch', 'CNNs', 'Transformers'], preferredSkills: ['CUDA', 'Distributed training'], experienceLevel: 'mid', growthPath: ['DL Engineer', 'Senior DL Engineer', 'Research Scientist'], companies: ['NVIDIA', 'Google DeepMind', 'OpenAI'] },
      { roadmapId: ml._id, jobTitle: 'MLOps Engineer', description: 'Build and maintain ML infrastructure', salaryRange: { min: 1000000, max: 3000000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Python', 'Docker', 'Kubernetes', 'CI/CD'], preferredSkills: ['Airflow', 'MLflow'], experienceLevel: 'junior', growthPath: ['MLOps Engineer', 'Senior MLOps', 'Platform Engineer'], companies: ['Tech giants', 'AI startups'] },
      { roadmapId: ml._id, jobTitle: 'AI Research Scientist', description: 'Conduct research to advance AI/ML', salaryRange: { min: 2000000, max: 8000000, currency: 'INR', period: 'year' }, demandLevel: 'medium', requiredSkills: ['PhD', 'Deep Learning', 'Mathematics', 'Publications'], preferredSkills: ['Novel architectures', 'Theoretical ML'], experienceLevel: 'senior', growthPath: ['Research Scientist', 'Senior Scientist', 'Research Director'], companies: ['Google Research', 'OpenAI', 'Meta FAIR'] },

      // SQL & Databases
      { roadmapId: sql._id, jobTitle: 'Database Administrator', description: 'Manage and maintain database systems', salaryRange: { min: 500000, max: 2000000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['SQL', 'Database management', 'Backup/Recovery'], preferredSkills: ['Cloud databases', 'Automation'], experienceLevel: 'junior', growthPath: ['DBA', 'Senior DBA', 'Lead DBA', 'Database Architect'], companies: ['Banks', 'Large enterprises'] },
      { roadmapId: sql._id, jobTitle: 'Data Engineer', description: 'Build data pipelines and infrastructure', salaryRange: { min: 800000, max: 3000000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['SQL', 'Python', 'ETL', 'Big data tools'], preferredSkills: ['Spark', 'Kafka'], experienceLevel: 'junior', growthPath: ['Data Engineer', 'Senior DE', 'Staff DE', 'Data Architect'], companies: ['Google', 'Amazon', 'Uber'] },
      { roadmapId: sql._id, jobTitle: 'Backend Developer (DB Focus)', description: 'Build database-driven applications', salaryRange: { min: 600000, max: 2200000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['SQL', 'ORM frameworks', 'API development'], preferredSkills: ['NoSQL', 'Caching'], experienceLevel: 'junior', growthPath: ['Backend Dev', 'Senior Dev', 'Tech Lead'], companies: ['All tech companies'] },

      // DevOps
      { roadmapId: devOps._id, jobTitle: 'DevOps Engineer', description: 'Automate software delivery processes', salaryRange: { min: 600000, max: 2500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Linux', 'Docker', 'CI/CD', 'Cloud platforms'], preferredSkills: ['Kubernetes', 'Terraform'], experienceLevel: 'junior', growthPath: ['DevOps Engineer', 'Senior DevOps', 'DevOps Lead', 'Platform Architect'], companies: ['All tech companies'] },
      { roadmapId: devOps._id, jobTitle: 'Site Reliability Engineer', description: 'Ensure reliability of production systems', salaryRange: { min: 1000000, max: 3500000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['Linux', 'Programming', 'Distributed systems', 'Monitoring'], preferredSkills: ['Kubernetes', 'Chaos engineering'], experienceLevel: 'mid', growthPath: ['SRE', 'Senior SRE', 'Staff SRE', 'SRE Manager'], companies: ['Google', 'Amazon', 'Netflix'] },
      { roadmapId: devOps._id, jobTitle: 'Cloud Engineer', description: 'Design and manage cloud infrastructure', salaryRange: { min: 700000, max: 2800000, currency: 'INR', period: 'year' }, demandLevel: 'very-high', requiredSkills: ['AWS/Azure/GCP', 'Networking', 'Security', 'IaC'], preferredSkills: ['Multi-cloud', 'FinOps'], experienceLevel: 'junior', growthPath: ['Cloud Engineer', 'Senior Cloud Engineer', 'Cloud Architect'], companies: ['Cloud providers', 'Consulting firms'] },
      { roadmapId: devOps._id, jobTitle: 'Platform Engineer', description: 'Build internal developer platforms', salaryRange: { min: 1200000, max: 3500000, currency: 'INR', period: 'year' }, demandLevel: 'high', requiredSkills: ['Kubernetes', 'Go/Python', 'Platform design'], preferredSkills: ['Service mesh', 'GitOps'], experienceLevel: 'mid', growthPath: ['Platform Engineer', 'Senior PE', 'Staff PE', 'Platform Architect'], companies: ['Large tech companies'] },
    ];

    await CareerInfo.insertMany(careers);
    console.log(`✅ Created ${careers.length} career entries`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('==================================');
    console.log(`📚 Roadmaps: ${createdRoadmaps.length}`);
    console.log(`📖 Topics: ${allTopics.length}`);
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

seedDatabase();
