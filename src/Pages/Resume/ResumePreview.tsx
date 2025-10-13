import { useState } from 'react';
import { User, Mail, Phone, MapPin, Download, Eye, X, Github, Linkedin, Globe } from 'lucide-react';

interface TemplateProps {
  color: string;
  gradient: string;
}

interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    period: string;
    achievements: string[];
  }>;
  education: {
    degree: string;
    institution: string;
    location: string;
    period: string;
  };
  skills: string[];
  certifications?: string[];
}

export default function ITResumeBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [withPhoto, setWithPhoto] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState('2');
  const [selectedStyle, setSelectedStyle] = useState('creative');
  const [selectedColor, setSelectedColor] = useState('#0891b2');
  const [selectedField, setSelectedField] = useState('software-dev');

  const resumeDataByField: Record<string, ResumeData> = {
    'software-dev': {
      name: 'Arjun Sharma',
      title: 'Senior Software Developer',
      email: 'arjun.sharma@email.com',
      phone: '+91 98765 43210',
      location: 'Bangalore, India',
      github: 'github.com/arjunsharma',
      linkedin: 'linkedin.com/in/arjunsharma',
      portfolio: 'arjunsharma.dev',
      summary: 'Innovative Software Developer with 5+ years of experience in full-stack development. Expert in building scalable web applications using React, Node.js, and cloud technologies. Passionate about clean code, agile methodologies, and delivering high-quality solutions.',
      experience: [
        {
          title: 'Senior Software Developer',
          company: 'Tech Innovations Pvt Ltd',
          location: 'Bangalore, India',
          period: 'Jan 2021 - Present',
          achievements: [
            'Led development of microservices architecture reducing system latency by 40%',
            'Architected and implemented CI/CD pipeline improving deployment efficiency by 60%',
            'Mentored team of 5 junior developers and conducted code reviews',
            'Developed RESTful APIs serving 1M+ daily requests with 99.9% uptime'
          ]
        },
        {
          title: 'Software Developer',
          company: 'Digital Solutions Inc',
          period: 'Jun 2019 - Dec 2020',
          location: 'Bangalore, India',
          achievements: [
            'Built responsive web applications using React and TypeScript',
            'Implemented authentication system using JWT and OAuth 2.0',
            'Optimized database queries reducing response time by 50%'
          ]
        }
      ],
      education: {
        degree: 'B.Tech in Computer Science',
        institution: 'IIT Bangalore',
        location: 'Bangalore, India',
        period: '2015 - 2019'
      },
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Python', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile/Scrum'],
      certifications: ['AWS Certified Solutions Architect', 'MongoDB Certified Developer']
    },
    'data-science': {
      name: 'Priya Verma',
      title: 'Data Scientist',
      email: 'priya.verma@email.com',
      phone: '+91 98765 43211',
      location: 'Hyderabad, India',
      github: 'github.com/priyaverma',
      linkedin: 'linkedin.com/in/priyaverma',
      summary: 'Results-driven Data Scientist with 4+ years of experience in machine learning, statistical analysis, and data visualization. Expertise in Python, R, and big data technologies. Proven track record of delivering actionable insights and building predictive models.',
      experience: [
        {
          title: 'Data Scientist',
          company: 'Analytics Corp',
          location: 'Hyderabad, India',
          period: 'Mar 2021 - Present',
          achievements: [
            'Developed ML models for customer churn prediction achieving 92% accuracy',
            'Built real-time analytics dashboard using Tableau and Power BI',
            'Conducted A/B testing resulting in 25% increase in user engagement',
            'Implemented NLP solutions for sentiment analysis on 10M+ customer reviews'
          ]
        },
        {
          title: 'Junior Data Analyst',
          company: 'Data Insights Ltd',
          period: 'Jul 2020 - Feb 2021',
          location: 'Hyderabad, India',
          achievements: [
            'Performed statistical analysis on large datasets using Python and R',
            'Created data pipelines for ETL processes using Apache Spark',
            'Developed predictive models for sales forecasting'
          ]
        }
      ],
      education: {
        degree: 'M.Sc. in Data Science',
        institution: 'IIIT Hyderabad',
        location: 'Hyderabad, India',
        period: '2018 - 2020'
      },
      skills: ['Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Tableau', 'Power BI', 'Apache Spark', 'Machine Learning', 'Deep Learning', 'Statistics'],
      certifications: ['Google Data Analytics Professional', 'IBM Data Science Professional']
    },
    'ai-ml': {
      name: 'Rahul Gupta',
      title: 'AI/ML Engineer',
      email: 'rahul.gupta@email.com',
      phone: '+91 98765 43212',
      location: 'Pune, India',
      github: 'github.com/rahulgupta',
      linkedin: 'linkedin.com/in/rahulgupta',
      portfolio: 'rahulgupta.ai',
      summary: 'Passionate AI/ML Engineer with 6+ years specializing in deep learning, computer vision, and NLP. Expert in designing and deploying production-ready AI systems. Strong background in research and innovation with published papers in leading conferences.',
      experience: [
        {
          title: 'Senior AI/ML Engineer',
          company: 'AI Innovation Labs',
          location: 'Pune, India',
          period: 'Feb 2020 - Present',
          achievements: [
            'Developed computer vision models for object detection with 95% mAP',
            'Built transformer-based NLP models for text classification and generation',
            'Deployed ML models on edge devices using TensorFlow Lite and ONNX',
            'Led research team resulting in 3 publications at top-tier conferences',
            'Optimized model inference speed by 70% using quantization techniques'
          ]
        },
        {
          title: 'ML Engineer',
          company: 'Tech AI Solutions',
          period: 'Jun 2018 - Jan 2020',
          location: 'Pune, India',
          achievements: [
            'Implemented recommendation systems using collaborative filtering',
            'Built chatbot using BERT and GPT models with 90% accuracy',
            'Created data annotation pipelines for training datasets'
          ]
        }
      ],
      education: {
        degree: 'M.Tech in Artificial Intelligence',
        institution: 'IIT Bombay',
        location: 'Mumbai, India',
        period: '2016 - 2018'
      },
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'YOLO', 'BERT', 'GPT', 'Transformers', 'Computer Vision', 'NLP', 'Deep Learning', 'MLOps', 'Docker', 'Kubernetes'],
      certifications: ['TensorFlow Developer Certificate', 'Deep Learning Specialization (Coursera)']
    },
    'devops': {
      name: 'Vikram Singh',
      title: 'DevOps Engineer',
      email: 'vikram.singh@email.com',
      phone: '+91 98765 43213',
      location: 'Gurgaon, India',
      github: 'github.com/vikramsingh',
      linkedin: 'linkedin.com/in/vikramsingh',
      summary: 'Experienced DevOps Engineer with 5+ years in cloud infrastructure, automation, and CI/CD. Expert in AWS, Azure, Docker, Kubernetes, and Infrastructure as Code. Focused on building reliable, scalable, and secure systems.',
      experience: [
        {
          title: 'Senior DevOps Engineer',
          company: 'Cloud Systems Ltd',
          location: 'Gurgaon, India',
          period: 'Jan 2021 - Present',
          achievements: [
            'Architected multi-region AWS infrastructure serving 5M+ users',
            'Implemented GitOps workflows using ArgoCD and Flux',
            'Reduced deployment time from 2 hours to 15 minutes using CI/CD automation',
            'Set up monitoring and alerting using Prometheus, Grafana, and ELK stack',
            'Managed Kubernetes clusters with 200+ microservices'
          ]
        },
        {
          title: 'DevOps Engineer',
          company: 'Tech Infrastructure Inc',
          period: 'Mar 2019 - Dec 2020',
          location: 'Gurgaon, India',
          achievements: [
            'Automated infrastructure provisioning using Terraform and Ansible',
            'Implemented Docker containerization for legacy applications',
            'Built CI/CD pipelines using Jenkins and GitLab CI'
          ]
        }
      ],
      education: {
        degree: 'B.E. in Information Technology',
        institution: 'Delhi Technological University',
        location: 'Delhi, India',
        period: '2015 - 2019'
      },
      skills: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'Prometheus', 'Grafana', 'ELK Stack', 'Python', 'Bash', 'Linux'],
      certifications: ['AWS Certified DevOps Engineer', 'Certified Kubernetes Administrator (CKA)']
    },
    'cybersecurity': {
      name: 'Ananya Reddy',
      title: 'Cybersecurity Analyst',
      email: 'ananya.reddy@email.com',
      phone: '+91 98765 43214',
      location: 'Chennai, India',
      linkedin: 'linkedin.com/in/ananyareddy',
      summary: 'Dedicated Cybersecurity Analyst with 4+ years protecting organizations from cyber threats. Expert in security monitoring, incident response, vulnerability assessment, and compliance. Strong knowledge of security frameworks and ethical hacking.',
      experience: [
        {
          title: 'Cybersecurity Analyst',
          company: 'SecureNet Solutions',
          location: 'Chennai, India',
          period: 'Apr 2021 - Present',
          achievements: [
            'Monitored and analyzed security events using SIEM tools (Splunk, QRadar)',
            'Conducted penetration testing identifying 50+ critical vulnerabilities',
            'Responded to 100+ security incidents with 99% resolution rate',
            'Implemented security policies and procedures ensuring ISO 27001 compliance',
            'Conducted security awareness training for 500+ employees'
          ]
        },
        {
          title: 'Security Analyst',
          company: 'CyberGuard Ltd',
          period: 'Aug 2020 - Mar 2021',
          location: 'Chennai, India',
          achievements: [
            'Performed vulnerability assessments and security audits',
            'Analyzed malware and conducted threat intelligence research',
            'Configured and managed firewall and IDS/IPS systems'
          ]
        }
      ],
      education: {
        degree: 'B.Tech in Computer Science & Engineering',
        institution: 'Anna University',
        location: 'Chennai, India',
        period: '2016 - 2020'
      },
      skills: ['Network Security', 'Penetration Testing', 'SIEM', 'IDS/IPS', 'Firewall', 'Wireshark', 'Metasploit', 'Burp Suite', 'Python', 'Linux', 'Cryptography', 'Incident Response', 'Risk Assessment'],
      certifications: ['CEH (Certified Ethical Hacker)', 'CompTIA Security+', 'CISSP (in progress)']
    },
    'cloud-architect': {
      name: 'Karthik Nair',
      title: 'Cloud Solutions Architect',
      email: 'karthik.nair@email.com',
      phone: '+91 98765 43215',
      location: 'Mumbai, India',
      github: 'github.com/karthiknair',
      linkedin: 'linkedin.com/in/karthiknair',
      summary: 'Innovative Cloud Solutions Architect with 7+ years designing and implementing enterprise cloud solutions. Expert in AWS, Azure, and multi-cloud strategies. Proven ability to architect scalable, cost-efficient, and highly available systems.',
      experience: [
        {
          title: 'Senior Cloud Solutions Architect',
          company: 'Enterprise Cloud Services',
          location: 'Mumbai, India',
          period: 'Mar 2020 - Present',
          achievements: [
            'Designed cloud architecture for Fortune 500 clients saving $2M+ annually',
            'Led cloud migration of 50+ applications with zero downtime',
            'Implemented disaster recovery solutions with RPO < 15 minutes',
            'Architected serverless solutions reducing operational costs by 45%',
            'Mentored 10+ cloud engineers on AWS and Azure best practices'
          ]
        },
        {
          title: 'Cloud Engineer',
          company: 'Cloud Tech Solutions',
          period: 'Jan 2018 - Feb 2020',
          location: 'Mumbai, India',
          achievements: [
            'Designed and deployed VPC architecture with multi-AZ redundancy',
            'Implemented cost optimization strategies reducing AWS bills by 30%',
            'Built auto-scaling infrastructure handling traffic spikes'
          ]
        }
      ],
      education: {
        degree: 'M.Tech in Cloud Computing',
        institution: 'IIT Delhi',
        location: 'Delhi, India',
        period: '2016 - 2018'
      },
      skills: ['AWS', 'Azure', 'GCP', 'Kubernetes', 'Terraform', 'CloudFormation', 'Lambda', 'API Gateway', 'VPC', 'Load Balancing', 'Microservices', 'Serverless', 'Cost Optimization', 'Security'],
      certifications: ['AWS Solutions Architect Professional', 'Azure Solutions Architect Expert', 'Google Cloud Architect']
    },
    'mobile-dev': {
      name: 'Sneha Patel',
      title: 'Mobile Application Developer',
      email: 'sneha.patel@email.com',
      phone: '+91 98765 43216',
      location: 'Ahmedabad, India',
      github: 'github.com/snehapatel',
      linkedin: 'linkedin.com/in/snehapatel',
      portfolio: 'snehapatel.dev',
      summary: 'Creative Mobile Developer with 5+ years building native and cross-platform applications. Expert in React Native, Flutter, iOS, and Android development. Passionate about creating intuitive user experiences and performance optimization.',
      experience: [
        {
          title: 'Senior Mobile Developer',
          company: 'MobileFirst Technologies',
          location: 'Ahmedabad, India',
          period: 'Feb 2021 - Present',
          achievements: [
            'Developed 10+ mobile apps with 5M+ combined downloads',
            'Led cross-platform development using React Native and Flutter',
            'Improved app performance reducing load time by 60%',
            'Implemented push notifications and real-time chat features',
            'Integrated payment gateways and third-party APIs'
          ]
        },
        {
          title: 'Mobile Developer',
          company: 'App Innovations Ltd',
          period: 'Jun 2019 - Jan 2021',
          location: 'Ahmedabad, India',
          achievements: [
            'Built native iOS apps using Swift and SwiftUI',
            'Developed Android applications using Kotlin and Jetpack Compose',
            'Implemented offline-first architecture using local databases'
          ]
        }
      ],
      education: {
        degree: 'B.Tech in Information Technology',
        institution: 'NIT Surat',
        location: 'Surat, India',
        period: '2015 - 2019'
      },
      skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'JavaScript', 'TypeScript', 'Firebase', 'SQLite', 'RESTful APIs', 'GraphQL', 'UI/UX', 'Git'],
      certifications: ['Google Associate Android Developer', 'iOS App Development (Apple)']
    },
    'blockchain': {
      name: 'Aditya Kumar',
      title: 'Blockchain Developer',
      email: 'aditya.kumar@email.com',
      phone: '+91 98765 43217',
      location: 'Bangalore, India',
      github: 'github.com/adityakumar',
      linkedin: 'linkedin.com/in/adityakumar',
      portfolio: 'adityakumar.eth',
      summary: 'Innovative Blockchain Developer with 4+ years specializing in smart contracts, DeFi, and Web3 applications. Expert in Solidity, Ethereum, and decentralized technologies. Passionate about building secure and transparent blockchain solutions.',
      experience: [
        {
          title: 'Senior Blockchain Developer',
          company: 'CryptoTech Solutions',
          location: 'Bangalore, India',
          period: 'Jan 2022 - Present',
          achievements: [
            'Developed 15+ smart contracts managing $10M+ in TVL',
            'Built DeFi protocols including DEX, lending, and staking platforms',
            'Conducted smart contract audits identifying critical vulnerabilities',
            'Implemented Layer 2 solutions reducing transaction costs by 90%',
            'Created NFT marketplaces with royalty mechanisms'
          ]
        },
        {
          title: 'Blockchain Developer',
          company: 'Web3 Innovations',
          period: 'Jul 2020 - Dec 2021',
          location: 'Bangalore, India',
          achievements: [
            'Developed ERC-20 and ERC-721 token standards',
            'Built dApps using React and Web3.js',
            'Integrated MetaMask and WalletConnect for authentication'
          ]
        }
      ],
      education: {
        degree: 'B.Tech in Computer Science',
        institution: 'IIT Kanpur',
        location: 'Kanpur, India',
        period: '2016 - 2020'
      },
      skills: ['Solidity', 'Ethereum', 'Web3.js', 'Hardhat', 'Truffle', 'IPFS', 'React', 'Node.js', 'Smart Contracts', 'DeFi', 'NFTs', 'Cryptography', 'Security Auditing'],
      certifications: ['Certified Blockchain Developer', 'Ethereum Developer Bootcamp']
    }
  };

  const colorOptions = [
    { name: 'Cyan', color: '#0891b2', gradient: 'from-cyan-600 to-cyan-500' },
    { name: 'Green', color: '#059669', gradient: 'from-green-600 to-green-500' },
    { name: 'Purple', color: '#7c3aed', gradient: 'from-purple-600 to-purple-500' },
    { name: 'Orange', color: '#ea580c', gradient: 'from-orange-600 to-orange-500' },
    { name: 'Red', color: '#dc2626', gradient: 'from-red-600 to-red-500' },
    { name: 'Navy', color: '#1e40af', gradient: 'from-blue-700 to-blue-600' },
    { name: 'Teal', color: '#0d9488', gradient: 'from-teal-600 to-teal-500' },
    { name: 'Pink', color: '#db2777', gradient: 'from-pink-600 to-pink-500' },
  ];

  const fieldOptions = [
    { id: 'software-dev', label: 'Software Development' },
    { id: 'data-science', label: 'Data Science' },
    { id: 'ai-ml', label: 'AI/ML Engineering' },
    { id: 'devops', label: 'DevOps' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'cloud-architect', label: 'Cloud Architecture' },
    { id: 'mobile-dev', label: 'Mobile Development' },
    { id: 'blockchain', label: 'Blockchain Development' }
  ];

  const resumeData = resumeDataByField[selectedField];

  const ResumeTemplate1 = ({ color, gradient }: TemplateProps) => (
    <div className="bg-white w-full aspect-[8.5/11] shadow-lg">
      <div className="flex h-full">
        <div className={`w-2/5 bg-gradient-to-br ${gradient} text-white p-6`}>
          <div className="mb-6">
            {withPhoto && (
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-12 h-12 text-white opacity-60" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-center mb-1">{resumeData.name}</h1>
            <p className="text-center text-sm opacity-90">{resumeData.title}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 pb-1 border-b border-white border-opacity-30">CONTACT</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-1.5">
                <Mail className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="break-all">{resumeData.email}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Phone className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{resumeData.phone}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{resumeData.location}</span>
              </div>
              {resumeData.github && (
                <div className="flex items-start gap-1.5">
                  <Github className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{resumeData.github}</span>
                </div>
              )}
              {resumeData.linkedin && (
                <div className="flex items-start gap-1.5">
                  <Linkedin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{resumeData.linkedin}</span>
                </div>
              )}
              {resumeData.portfolio && (
                <div className="flex items-start gap-1.5">
                  <Globe className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{resumeData.portfolio}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 pb-1 border-b border-white border-opacity-30">EDUCATION</h3>
            <div className="text-xs space-y-1">
              <p className="font-semibold">{resumeData.education.period}</p>
              <p className="font-bold">{resumeData.education.degree}</p>
              <p className="opacity-90">{resumeData.education.institution}</p>
              <p className="opacity-80">{resumeData.education.location}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold mb-2 pb-1 border-b border-white border-opacity-30">SKILLS</h3>
            <div className="flex flex-wrap gap-1">
              {resumeData.skills.map((skill, idx) => (
                <span key={idx} className="text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-2 pb-1 border-b border-white border-opacity-30">CERTIFICATIONS</h3>
              <ul className="space-y-1 text-xs">
                {resumeData.certifications.map((cert, idx) => (
                  <li key={idx} className="opacity-90">• {cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 p-6 bg-white">
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}` }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 pb-1" style={{ color, borderBottom: `2px solid ${color}` }}>
              WORK EXPERIENCE
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">{exp.title}</h3>
                      <p className="text-xs font-semibold" style={{ color }}>{exp.company}</p>
                    </div>
                    <span className="text-xs text-gray-600">{exp.period}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{exp.location}</p>
                  <ul className="space-y-0.5">
                    {exp.achievements.map((achievement, aidx) => (
                      <li key={aidx} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span style={{ color }} className="mt-0.5">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ResumeTemplate2 = ({ color, gradient }: TemplateProps) => (
    <div className="bg-white w-full aspect-[8.5/11] shadow-lg p-8">
      <div className="text-center mb-6 pb-4" style={{ borderBottom: `3px solid ${color}` }}>
        {withPhoto && (
          <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-full mx-auto mb-3 flex items-center justify-center`}>
            <User className="w-10 h-10 text-white" />
          </div>
        )}
        <h1 className="text-3xl font-bold text-gray-800 mb-1">{resumeData.name}</h1>
        <p className="text-lg font-semibold mb-3" style={{ color }}>{resumeData.title}</p>
        <div className="flex justify-center gap-3 text-xs text-gray-600 flex-wrap">
          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{resumeData.email}</span>
          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{resumeData.phone}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{resumeData.location}</span>
          {resumeData.github && <span className="flex items-center gap-1"><Github className="w-3 h-3" />{resumeData.github}</span>}
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}20` }}>
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-xs text-gray-700 leading-relaxed">{resumeData.summary}</p>
      </div>

      <div className="mb-5">
        <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}20` }}>
          WORK EXPERIENCE
        </h2>
        <div className="space-y-3">
          {resumeData.experience.map((exp, idx) => (
            <div key={idx}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{exp.title}</h3>
                  <p className="text-xs font-semibold" style={{ color }}>{exp.company} • {exp.location}</p>
                </div>
                <span className="text-xs text-gray-600 font-medium">{exp.period}</span>
              </div>
              <ul className="space-y-0.5">
                {exp.achievements.map((achievement, aidx) => (
                  <li key={aidx} className="text-xs text-gray-700 flex items-start gap-1.5">
                    <span style={{ color }} className="font-bold mt-0.5">→</span>
                    <span>{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}20` }}>
            EDUCATION
          </h2>
          <div className="text-xs">
            <p className="font-bold text-gray-800">{resumeData.education.degree}</p>
            <p className="font-semibold" style={{ color }}>{resumeData.education.institution}</p>
            <p className="text-gray-600">{resumeData.education.location} • {resumeData.education.period}</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}20` }}>
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {resumeData.skills.slice(0, 8).map((skill, idx) => (
              <span key={idx} className="text-xs text-white px-2 py-1 rounded-full" style={{ background: color }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {resumeData.certifications && resumeData.certifications.length > 0 && (
        <div className="mt-4">
          <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}20` }}>
            CERTIFICATIONS
          </h2>
          <div className="text-xs text-gray-700">
            {resumeData.certifications.map((cert, idx) => (
              <span key={idx}>{cert}{idx < resumeData.certifications!.length - 1 ? ' • ' : ''}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const ResumeTemplate3 = ({ color, gradient }: TemplateProps) => (
    <div className="bg-gray-50 w-full aspect-[8.5/11] shadow-lg">
      <div className={`bg-gradient-to-r ${gradient} text-white p-6`}>
        <div className="flex items-center gap-4">
          {withPhoto && (
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-white" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{resumeData.name}</h1>
            <p className="text-lg opacity-90 mb-2">{resumeData.title}</p>
            <div className="flex gap-3 text-xs flex-wrap">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{resumeData.email}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{resumeData.phone}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{resumeData.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5">
          <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}30` }}>
            SUMMARY
          </h2>
          <p className="text-xs text-gray-700">{resumeData.summary}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div>
              <h2 className="text-base font-bold mb-2 pb-1" style={{ color, borderBottom: `2px solid ${color}30` }}>
                EXPERIENCE
              </h2>
              <div className="space-y-3">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-sm font-bold text-gray-800">{exp.title}</h3>
                        <p className="text-xs font-semibold" style={{ color }}>{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-600 px-2 py-0.5 rounded" style={{ background: `${color}15` }}>
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-0.5 mt-2">
                      {exp.achievements.map((achievement, aidx) => (
                        <li key={aidx} className="text-xs text-gray-700 flex items-start gap-1.5">
                          <span style={{ color }}>▸</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h2 className="text-sm font-bold mb-2" style={{ color }}>SKILLS</h2>
              <div className="flex flex-wrap gap-1.5">
                {resumeData.skills.slice(0, 10).map((skill, idx) => (
                  <span key={idx} className="text-xs text-white px-2 py-0.5 rounded" style={{ background: color }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-sm">
              <h2 className="text-sm font-bold mb-2" style={{ color }}>EDUCATION</h2>
              <div className="text-xs">
                <p className="font-bold text-gray-800">{resumeData.education.degree}</p>
                <p className="font-semibold" style={{ color }}>{resumeData.education.institution}</p>
                <p className="text-gray-600">{resumeData.education.period}</p>
              </div>
            </div>

            {resumeData.certifications && resumeData.certifications.length > 0 && (
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <h2 className="text-sm font-bold mb-2" style={{ color }}>CERTIFICATIONS</h2>
                <ul className="text-xs space-y-1 text-gray-700">
                  {resumeData.certifications.map((cert, idx) => (
                    <li key={idx}>• {cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    const selectedColorData = colorOptions.find(c => c.color === selectedColor) || colorOptions[0];
    const props = { color: selectedColorData.color, gradient: selectedColorData.gradient };
    
    if (selectedColumns === '1') {
      return <ResumeTemplate2 {...props} />;
    } else {
      if (selectedTemplate === 1) return <ResumeTemplate1 {...props} />;
      if (selectedTemplate === 2) return <ResumeTemplate2 {...props} />;
      return <ResumeTemplate3 {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text  mb-2"
          style={{color:" #00ADB5"}}
          >
           Your Resume
          </h1>
          <p className="text-gray-600">Choose Your template for Your Profation </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={() => {
                    setWithPhoto(true);
                    setSelectedColumns('2');
                    setSelectedStyle('creative');
                    setSelectedField('software-dev');
                  }}
                  className="text-cyan-600 text-sm font-semibold hover:text-cyan-700"
                >
                  Clear Filters
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">IT Field</h3>
                <div className="space-y-2">
                  {fieldOptions.map((field) => (
                    <label key={field.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="field" 
                        value={field.id} 
                        checked={selectedField === field.id} 
                        onChange={(e) => setSelectedField(e.target.value)} 
                        className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" 
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Headshot</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={withPhoto} onChange={(e) => setWithPhoto(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">With photo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!withPhoto} onChange={(e) => setWithPhoto(!e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">Without photo</span>
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Columns</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="columns" value="1" checked={selectedColumns === '1'} onChange={(e) => setSelectedColumns(e.target.value)} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">1 Column</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="columns" value="2" checked={selectedColumns === '2'} onChange={(e) => setSelectedColumns(e.target.value)} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">2 Columns</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Style</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="style" value="traditional" checked={selectedStyle === 'traditional'} onChange={(e) => setSelectedStyle(e.target.value)} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">Traditional</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="style" value="creative" checked={selectedStyle === 'creative'} onChange={(e) => setSelectedStyle(e.target.value)} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">Creative</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="style" value="contemporary" checked={selectedStyle === 'contemporary'} onChange={(e) => setSelectedStyle(e.target.value)} className="w-4 h-4 text-cyan-600 focus:ring-cyan-500" />
                    <span className="text-sm text-gray-700">Contemporary</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((templateId) => (
                <div key={templateId} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1 relative">
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      RECOMMENDED
                    </div>
                  </div>
                  
                  <div className="h-64 bg-gray-100 relative overflow-hidden">
                    <div className="scale-[0.28] origin-top-left absolute">
                      {renderTemplate()}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{resumeData.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{resumeData.title}</p>
                    
                    <div className="flex gap-2 mb-4">
                      {colorOptions.map((colorOpt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedColor(colorOpt.color)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === colorOpt.color ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                          style={{ background: colorOpt.color }}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setSelectedTemplate(templateId); setShowPreview(true); }}
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-sm font-semibold py-2 px-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </button>
                      <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto relative">
              <button onClick={() => setShowPreview(false)} className="sticky top-4 right-4 float-right bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-2 rounded-full hover:shadow-lg z-10">
                <X className="w-5 h-5" />
              </button>
              <div className="p-8">
                <div className="scale-90 origin-top">
                  {renderTemplate()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}