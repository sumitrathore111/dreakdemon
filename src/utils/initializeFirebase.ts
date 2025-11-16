// Helper script to initialize Firebase collections with sample data
// Run this once to populate your Firebase database

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../service/Firebase';
import { companies } from '../data';

export async function initializeCompanies() {
  try {
    const companiesRef = collection(db, 'Companies');
    for (const company of companies) {
      await addDoc(companiesRef, company);
    }
    console.log('✅ Companies initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing companies:', error);
  }
}

export async function initializeMarathonChallenges() {
  try {
    const challengesRef = collection(db, 'Marathon_Challenges');
    
    // Sample challenges for the next 7 days
    const sampleChallenges = [
      {
        title: 'Array Manipulation Challenge',
        type: 'MCQ',
        difficulty: 'Medium',
        points: 25,
        timeLimit: 30,
        topic: 'Data Structures',
        description: 'Test your knowledge of array manipulation techniques and algorithms.',
        question: 'What is the time complexity of finding the maximum element in an unsorted array of n elements?',
        options: [
          { id: 'a', text: 'O(1)' },
          { id: 'b', text: 'O(log n)' },
          { id: 'c', text: 'O(n)' },
          { id: 'd', text: 'O(n log n)' }
        ],
        correctAnswer: 'c',
        date: Timestamp.now()
      },
      {
        title: 'String Algorithms',
        type: 'MCQ',
        difficulty: 'Easy',
        points: 20,
        timeLimit: 25,
        topic: 'Strings',
        description: 'Understanding string manipulation basics.',
        question: 'Which method is used to reverse a string in JavaScript?',
        options: [
          { id: 'a', text: 'str.reverse()' },
          { id: 'b', text: 'str.split("").reverse().join("")' },
          { id: 'c', text: 'str.flip()' },
          { id: 'd', text: 'reverse(str)' }
        ],
        correctAnswer: 'b',
        date: Timestamp.fromDate(new Date(Date.now() + 86400000)) // Tomorrow
      },
      {
        title: 'Tree Traversal',
        type: 'MCQ',
        difficulty: 'Medium',
        points: 30,
        timeLimit: 35,
        topic: 'Trees',
        description: 'Test your knowledge of tree data structures.',
        question: 'In a binary search tree, which traversal gives elements in sorted order?',
        options: [
          { id: 'a', text: 'Pre-order' },
          { id: 'b', text: 'In-order' },
          { id: 'c', text: 'Post-order' },
          { id: 'd', text: 'Level-order' }
        ],
        correctAnswer: 'b',
        date: Timestamp.fromDate(new Date(Date.now() + 172800000)) // Day after tomorrow
      }
    ];

    for (const challenge of sampleChallenges) {
      await addDoc(challengesRef, challenge);
    }
    console.log('✅ Marathon challenges initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing marathon challenges:', error);
  }
}

export async function initializeCourses() {
  try {
    const coursesRef = collection(db, 'Courses');
    
    const sampleCourses = [
      {
        id: "c-js-101",
        title: "JavaScript Fundamentals",
        instructor: "Amit Verma",
        duration: "4 weeks",
        lessons: 24,
        level: "Beginner",
        rating: 4.5,
        price: 0,
        tags: ["JavaScript", "Web"],
        thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: "c-react-adv",
        title: "Advanced React Patterns",
        instructor: "Sneha Rao",
        duration: "6 weeks",
        lessons: 30,
        level: "Advanced",
        rating: 4.8,
        price: 1299,
        tags: ["React", "Frontend"],
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: "c-ml-101",
        title: "Intro to Machine Learning",
        instructor: "Dr. R. Kaur",
        duration: "8 weeks",
        lessons: 40,
        level: "Intermediate",
        rating: 4.6,
        price: 1999,
        tags: ["ML", "Python"],
        thumbnail: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: "c-node-backend",
        title: "Node.js Backend Development",
        instructor: "Priya Sharma",
        duration: "5 weeks",
        lessons: 28,
        level: "Intermediate",
        rating: 4.7,
        price: 999,
        tags: ["Node.js", "Backend", "API"],
        thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=60",
      }
    ];

    for (const course of sampleCourses) {
      await addDoc(coursesRef, course);
    }
    console.log('✅ Courses initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing courses:', error);
  }
}

// Main initialization function
export async function initializeAllCollections() {
  console.log('🚀 Starting Firebase initialization...');
  
  await initializeCompanies();
  await initializeMarathonChallenges();
  await initializeCourses();
  
  console.log('✅ All collections initialized successfully!');
}
