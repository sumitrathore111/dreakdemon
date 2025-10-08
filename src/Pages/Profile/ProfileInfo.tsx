import { useEffect, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Plus,
  X,
  Edit3,
  Save,
  FileText,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from "../../Component/Global/ui";
import { useDataContext } from "../../Context/UserDataContext";

interface Education {
  degree: string;
  school: string;
  year: string;
}
interface Experience {
  title: string;
  company: string;
  year: string;
  desc: string;
}
interface Link {
  platform: string;
  url: string;
}

interface ProfileData {
  uid: string;
  email: string | null;
  createdAt: any;
  role: "student" | "admin";
  isprofileComplete: boolean,
  name: string;
  phone: string;
  location: string;
  institute: string;
  bio: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  achievements: string[];
  links: Link[];
  profileCompletion: number,
  languages: Array<String>,
  yearOfStudy: number

}


export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    uid:'',
    name: "Your Name",
    email: "you@example.com",
    phone: "9999999999",
    location: "Location",
    institute: "University Name",
    bio: "About yourself",
    skills: [],
    education: [],
    experience: [],
    achievements: [],
    links: [],
    profileCompletion: 0,
    languages: [],
    yearOfStudy: 0,
    createdAt:"",
    isprofileComplete:false,
    role :'student'
  });

  const [newAchievement, setNewAchievement] = useState("");
  const [newEducation, setNewEducation] = useState<Education>({
    degree: "",
    school: "",
    year: "",
  });
  const [newExperience, setNewExperience] = useState<Experience>({
    title: "",
    company: "",
    year: "",
    desc: "",
  });
  const [newLink, setNewLink] = useState<Link>({ platform: "", url: "" });
  const [gender, setgender] = useState('Male')
  const { avatrUrl, pushDataWithId, userprofile } = useDataContext()

  const handleAddSkill = () => {
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = () => {
    pushDataWithId(profile)
    setIsEditing(false);
  }
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof ProfileData
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setProfile((prev) => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement],
      }));
      setNewAchievement("");
    }
  };
  const handleRemoveAchievement = (ach: string) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a !== ach),
    }));
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      setProfile((prev) => ({
        ...prev,
        education: [...prev.education, newEducation],
      }));
      setNewEducation({ degree: "", school: "", year: "" });
    }
  };
  const handleRemoveEducation = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      setProfile((prev) => ({
        ...prev,
        experience: [...prev.experience, newExperience],
      }));
      setNewExperience({ title: "", company: "", year: "", desc: "" });
    }
  };
  const handleRemoveExperience = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const handleAddLink = () => {
    if (newLink.platform && newLink.url) {
      setProfile((prev) => ({
        ...prev,
        links: [...prev.links, newLink],
      }));
      setNewLink({ platform: "", url: "" });
    }
  };
  const handleRemoveLink = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };
  useEffect(() => {
    setProfile(userprofile)
    setgender("male")
  }, [])

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-10 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Manage your personal information and skills
          </p>
        </div>
        <Button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="hover:from-blue-700 hover:to-green-700 w-full sm:w-auto"
          style={{ backgroundColor: "#00ADB5" }}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary */}
        <div>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: "#00ADB5" }}
              >
                {avatrUrl && (
                  <img
                    src={avatrUrl}
                    alt="Random Avatar"
                    className="w-full h-full rounded-full"
                  />
                )}
              </div>
              <h3 className="font-semibold">{profile?.name}</h3>
              <p className="text-sm text-gray-500">{profile?.institute}</p>

              <div className="space-y-2 mt-2 text-left">
                <div className="flex items-center gap-2 text-sm break-all">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="truncate">{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>+ 91 {profile?.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-purple-600" />
                  <span>{profile?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-orange-600" />
                  <span>{profile?.institute}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-pink-600 flex-shrink-0" />
                  <span className="break-words">{profile?.bio}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Basic Information */}
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile?.name}
                    onChange={(e) => handleInputChange(e, "name")}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.email ?? ""}
                    onChange={(e) => handleInputChange(e, "email")}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile?.phone}
                    onChange={(e) => handleInputChange(e, "phone")}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="institute">Institute</Label>
                  <Input
                    id="institute"
                    value={profile?.institute}
                    onChange={(e) => handleInputChange(e, "institute")}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile?.location}
                  onChange={(e) => handleInputChange(e, "location")}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile?.bio}
                  onChange={(e) => handleInputChange(e, "bio")}
                  disabled={!isEditing}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>


      </div>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-indigo-600" /> Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.education?.map((edu, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            >
              <div>
                <p className="font-semibold">{edu.degree}</p>
                <p className="text-sm text-gray-500">
                  {edu.school} | {edu.year}
                </p>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveEducation(i)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                placeholder="Degree"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, degree: e.target.value })
                }
              />
              <Input
                placeholder="School"
                value={newEducation.school}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, school: e.target.value })
                }
              />
              <Input
                placeholder="Year"
                value={newEducation.year}
                onChange={(e) =>
                  setNewEducation({ ...newEducation, year: e.target.value })
                }
              />
              <Button onClick={handleAddEducation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-yellow-600" /> Experience /
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {profile?.experience.map((exp, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between sm:items-start gap-2"
            >
              <div>
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-gray-600">
                  {exp.company} | {exp.year}
                </p>
                <p className="text-gray-500">{exp.desc}</p>
              </div>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExperience(i)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <Input
                placeholder="Title"
                value={newExperience.title}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, title: e.target.value })
                }
              />
              <Input
                placeholder="Company"
                value={newExperience.company}
                onChange={(e) =>
                  setNewExperience({
                    ...newExperience,
                    company: e.target.value,
                  })
                }
              />
              <Input
                placeholder="Year"
                value={newExperience.year}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, year: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={newExperience.desc}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, desc: e.target.value })
                }
              />
              <Button onClick={handleAddExperience}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" /> Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {profile?.achievements.map((ach, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {ach}
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAchievement(ach)}
                  className="p-0 h-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Input
                placeholder="New achievement"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
              />
              <Button onClick={handleAddAchievement}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" /> Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile?.links.map((link, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline break-all"
              >
                {link.platform}: {link.url}
              </a>
              {isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLink(i)}
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Platform"
                value={newLink.platform}
                onChange={(e) =>
                  setNewLink({ ...newLink, platform: e.target.value })
                }
              />
              <Input
                placeholder="URL"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
              />
              <Button onClick={handleAddLink}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" /> Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing ? <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Add new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) =>
                e.key === "Enter" && handleAddSkill()
              }
              disabled={!isEditing}
            />
            <Button onClick={handleAddSkill} disabled={!isEditing}>
              <Plus className="h-4 w-4" />
            </Button>
          </div> : null}
          <div className="flex flex-wrap gap-2">
            {profile?.skills.map((skill, i) => (
              <Badge
                key={i}
                variant="primary"
                className="flex items-center gap-1"
              >
                {skill}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
