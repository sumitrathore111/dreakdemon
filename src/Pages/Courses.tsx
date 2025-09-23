import React from "react";
import { useNavigate } from "react-router-dom";
// import { useDataContext } from "../Context/UserDataContext";

type Course = {
  id: string;
  title: string;
  instructor: string;
  duration?: string; // e.g. "6 weeks"
  lessons?: number;
  level?: "Beginner" | "Intermediate" | "Advanced";
  rating?: number; // 0-5
  price?: number; // 0 means free
  tags?: string[];
  thumbnail?: string; // optional image URL
};
type EnrolledCourse = {
  id: string;
  title: string;
  instructor: string;
  progress: number; // percentage (0-100)
  lessonsCompleted: number;
  totalLessons: number;
  thumbnail?: string;
  lastAccessed?: string; // e.g. "2 days ago"
};
const Courses: React.FC = () => {
  
  // const { courses } = useDataContext()
  const navigation = useNavigate()

 


  const handleaboutproject = () => {
    navigation("/course/1")
  }
  const mockCourses: Course[] = [
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
  ];
  const mockEnrolledCourses: EnrolledCourse[] = [
    {
      id: "ec-js-101",
      title: "JavaScript Fundamentals",
      instructor: "Amit Verma",
      progress: 60,
      lessonsCompleted: 15,
      totalLessons: 25,
      lastAccessed: "2 days ago",
      thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=60",
    },
    {
      id: "ec-react-201",
      title: "React for Beginners",
      instructor: "Sneha Rao",
      progress: 35,
      lessonsCompleted: 7,
      totalLessons: 20,
      lastAccessed: "5 hours ago",
      thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-10">

      {/* Current Courses */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">My Courses</h2>


        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {mockEnrolledCourses.map((c) => (
            <article
              key={c.id}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate">{c.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-300 mb-3">{c.instructor}</p>


                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-slate-300">Progress</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${c.progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    {c.lessonsCompleted} / {c.totalLessons} lessons
                  </p>
                </div>


                {/* Last accessed */}
                {c.lastAccessed && (
                  <p className="text-xs text-gray-400 mb-3">Last accessed: {c.lastAccessed}</p>
                )}


                {/* Actions */}
                <div className="flex justify-between items-center">
                  <button
                    // onClick={() => onContinue?.(c.id)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    Continue
                  </button>
                  <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-300">
                    View Details →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>


        {/* {courses.length === 0 && (
          <div className="mt-8 text-center text-gray-500">You haven’t enrolled in any courses yet.</div>
        )} */}
      </section>

      {/* Available Courses */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold">Available Courses</h2>
          <p className="text-sm text-gray-500">Browse and enroll in courses that fit your goals</p>
        </div>


        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((c) => (
            <article
              key={c.id}
              className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              aria-label={`Course card: ${c.title}`}>





              {/* Body */}
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white truncate">{c.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">{c.instructor}</p>
                  </div>


                  <div className="text-right">
                    <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {c.price && c.price > 0 ? `₹${c.price}` : "Free"}
                    </div>
                  </div>
                </div>


                <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full">{c.level ?? "Beginner"}</span>

                    {c.tags && c.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded-full">{tag}</span>
                    ))}
                  </div>


                  <div className="flex items-center gap-2">
                    {/* <StarRating rating={c.rating ?? 0} /> */}
                    <span className="text-xs">{c.lessons ? `${c.lessons} lessons` : c.duration ?? "—"}</span>
                  </div>
                </div>


                <div className="mt-4 flex items-center justify-between">
                  <button
                    // onClick={() => onEnroll?.(c.id)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    Enroll
                  </button>


                  <a
                    href="#"
                    onClick={() => handleaboutproject()}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-slate-300">
                    Details →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>


        {/* {courses.length === 0 && (
          <div className="mt-8 text-center text-gray-500">No courses available right now.</div>
        )} */}
      </section>

    </div>
  );
};


export default Courses;
