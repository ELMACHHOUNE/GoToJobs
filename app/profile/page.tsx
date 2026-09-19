"use client";

import { useState, useMemo } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/store-provider";
import { WORKPLACE_TYPES } from "@/lib/store/schema";
import type { Profile } from "@/lib/store/schema";

export default function ProfilePage() {
  const { profile, updateProfile, resetProfile } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Profile>>({});
  const [skillsInput, setSkillsInput] = useState("");
  const [preferredRolesInput, setPreferredRolesInput] = useState("");
  const [preferredLocationsInput, setPreferredLocationsInput] = useState("");
  const [education] = useState<Profile["education"]>([]);
  const [editingEduIndex, setEditingEduIndex] = useState<number | null>(null);
  const [eduForm, setEduForm] = useState({ degree: "", fieldOfStudy: "", institution: "", startYear: "", endYear: "" });

  const completion = useMemo(() => calculateCompletion(profile), [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile(form);
    setEditing(false);
  };

  const addSkill = (skill: string) => {
    const normalized = skill.trim().toLowerCase();
    if (normalized && !profile.skills.includes(normalized)) {
      setForm((prev) => ({ ...prev, skills: [...(prev.skills || profile.skills), normalized] }));
    }
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: (prev.skills || profile.skills).filter((s) => s !== skill) }));
  };

  const addPreferredRole = (role: string) => {
    const trimmed = role.trim();
    if (trimmed && !profile.preferredRoles.includes(trimmed)) {
      setForm((prev) => ({ ...prev, preferredRoles: [...(prev.preferredRoles || profile.preferredRoles), trimmed] }));
    }
  };

  const removePreferredRole = (role: string) => {
    setForm((prev) => ({ ...prev, preferredRoles: (prev.preferredRoles || profile.preferredRoles).filter((r) => r !== role) }));
  };

  const addPreferredLocation = (loc: string) => {
    const trimmed = loc.trim();
    if (trimmed && !profile.preferredLocations.includes(trimmed)) {
      setForm((prev) => ({ ...prev, preferredLocations: [...(prev.preferredLocations || profile.preferredLocations), trimmed] }));
    }
  };

  const removePreferredLocation = (loc: string) => {
    setForm((prev) => ({ ...prev, preferredLocations: (prev.preferredLocations || profile.preferredLocations).filter((l) => l !== loc) }));
  };

  const handleEducationSave = () => {
    const entry = {
      id: editingEduIndex !== null ? education[editingEduIndex].id : crypto.randomUUID(),
      degree: eduForm.degree,
      fieldOfStudy: eduForm.fieldOfStudy,
      institution: eduForm.institution,
      startYear: eduForm.startYear ? parseInt(eduForm.startYear) : undefined,
      endYear: eduForm.endYear ? parseInt(eduForm.endYear) : undefined,
    };
    if (editingEduIndex !== null) {
      const updated = [...education];
      updated[editingEduIndex] = entry;
      setForm((prev) => ({ ...prev, education: updated }));
    } else {
      setForm((prev) => ({ ...prev, education: [...(prev.education || education), entry] }));
    }
    setEditingEduIndex(null);
    setEduForm({ degree: "", fieldOfStudy: "", institution: "", startYear: "", endYear: "" });
  };

  const handleEducationEdit = (index: number) => {
    const e = education[index];
    setEditingEduIndex(index);
    setEduForm({
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      institution: e.institution,
      startYear: e.startYear?.toString() || "",
      endYear: e.endYear?.toString() || "",
    });
  };

  const handleEducationDelete = (index: number) => {
    setForm((prev) => ({ ...prev, education: prev.education?.filter((_, i) => i !== index) || education.filter((_, i) => i !== index) }));
  };

  const skills = form.skills ?? profile.skills;
  const preferredRoles = form.preferredRoles ?? profile.preferredRoles;
  const preferredLocations = form.preferredLocations ?? profile.preferredLocations;
  const workplacePreferences = form.workplacePreferences ?? profile.workplacePreferences;
  const educationList = form.education ?? profile.education;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your professional profile for better job matches</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Completion</span>
            <Progress value={completion} className="w-40 h-2" />
            <span className="text-sm font-medium">{completion}%</span>
          </div>
        </div>
      </div>

      {!editing ? (
        <ProfileView
          profile={profile}
          completion={completion}
          onEdit={() => { setForm({}); setEditing(true); }}
          onReset={resetProfile}
        />
      ) : (
        <ProfileForm
          profile={profile}
          form={form}
          setForm={setForm}
          skills={skills}
          setSkills={addSkill}
          removeSkill={removeSkill}
          preferredRoles={preferredRoles}
          setPreferredRole={addPreferredRole}
          removePreferredRole={removePreferredRole}
          preferredLocations={preferredLocations}
          setPreferredLocation={addPreferredLocation}
          removePreferredLocation={removePreferredLocation}
          workplacePreferences={workplacePreferences}
          education={educationList}
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          preferredRolesInput={preferredRolesInput}
          setPreferredRolesInput={setPreferredRolesInput}
          preferredLocationsInput={preferredLocationsInput}
          setPreferredLocationsInput={setPreferredLocationsInput}
          handleInputChange={handleInputChange}
          handleSave={handleSave}
          setEditing={setEditing}
          editingEduIndex={editingEduIndex}
          setEditingEduIndex={setEditingEduIndex}
          eduForm={eduForm}
          setEduForm={setEduForm}
          handleEducationSave={handleEducationSave}
          handleEducationEdit={handleEducationEdit}
          handleEducationDelete={handleEducationDelete}
        />
      )}
    </div>
  );
}

function ProfileView({
  profile,
  completion,
  onEdit,
  onReset,
}: {
  profile: Profile;
  completion: number;
  onEdit: () => void;
  onReset: () => void;
}) {
  const getWorkplaceLabel = (type: string) => type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Profile completion: {completion}%</CardTitle>
          <Progress value={completion} className="w-48 h-3" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { label: "Name", value: profile.name || "—" },
              { label: "Title", value: profile.title || "—" },
              { label: "Bio", value: profile.bio || "—", fullWidth: true },
              { label: "Years of experience", value: profile.yearsOfExperience?.toString() || "—" },
            ].map((field, i) => (
              <div key={i} className={cn(field.fullWidth && "md:col-span-2")}>
                <Label className="text-muted-foreground">{field.label}</Label>
                <p className="font-medium">{field.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills ({profile.skills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <Badge key={skill} variant="outline">{skill}</Badge>
            ))}
            {profile.skills.length === 0 && <p className="text-muted-foreground">No skills added</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred roles ({profile.preferredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.preferredRoles.map((role) => (
              <Badge key={role} variant="secondary">{role}</Badge>
            ))}
            {profile.preferredRoles.length === 0 && <p className="text-muted-foreground">No preferred roles</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred locations ({profile.preferredLocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.preferredLocations.map((loc) => (
              <Badge key={loc} variant="outline">{loc}</Badge>
            ))}
            {profile.preferredLocations.length === 0 && <p className="text-muted-foreground">No preferred locations</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workplace preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profile.workplacePreferences.map((pref) => (
              <Badge key={pref} variant="default">{getWorkplaceLabel(pref)}</Badge>
            ))}
            {profile.workplacePreferences.length === 0 && <p className="text-muted-foreground">No preferences set</p>}
          </div>
        </CardContent>
      </Card>

      {profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Education ({profile.education.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.education.map((edu, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.fieldOfStudy} · {edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear ? `${edu.startYear}` : "—"} – {edu.endYear ? `${edu.endYear}` : "Present"}
                  </p>
                </div>
              ))}
            </div>
</CardContent>
      </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={onEdit}>Edit profile</Button>
        <Button variant="outline" onClick={onReset}>Reset to defaults</Button>
      </div>
    </div>
  );
}

function ProfileForm({
  profile,
  form,
  setForm,
  skills,
  setSkills,
  removeSkill,
  preferredRoles,
  setPreferredRole,
  removePreferredRole,
  preferredLocations,
  setPreferredLocation,
  removePreferredLocation,
  workplacePreferences,
  education,
  skillsInput,
  setSkillsInput,
  preferredRolesInput,
  setPreferredRolesInput,
  preferredLocationsInput,
  setPreferredLocationsInput,
  handleInputChange,
  handleSave,
  setEditing,
  editingEduIndex,
  setEditingEduIndex,
  eduForm,
  setEduForm,
  handleEducationSave,
  handleEducationEdit,
  handleEducationDelete,
}: {
  profile: Profile;
  form: Partial<Profile>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Profile>>>;
  skills: string[];
  setSkills: (skill: string) => void;
  removeSkill: (skill: string) => void;
  preferredRoles: string[];
  setPreferredRole: (role: string) => void;
  removePreferredRole: (role: string) => void;
  preferredLocations: string[];
  setPreferredLocation: (loc: string) => void;
  removePreferredLocation: (loc: string) => void;
  workplacePreferences: string[];
  education: Profile["education"];
  skillsInput: string;
  setSkillsInput: React.Dispatch<React.SetStateAction<string>>;
  preferredRolesInput: string;
  setPreferredRolesInput: React.Dispatch<React.SetStateAction<string>>;
  preferredLocationsInput: string;
  setPreferredLocationsInput: React.Dispatch<React.SetStateAction<string>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  setEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editingEduIndex: number | null;
  setEditingEduIndex: React.Dispatch<React.SetStateAction<number | null>>;
  eduForm: { degree: string; fieldOfStudy: string; institution: string; startYear: string; endYear: string };
  setEduForm: React.Dispatch<React.SetStateAction<{ degree: string; fieldOfStudy: string; institution: string; startYear: string; endYear: string }>>;
  handleEducationSave: () => void;
  handleEducationEdit: (index: number) => void;
  handleEducationDelete: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" value={form.name ?? profile.name} onChange={handleInputChange} placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="title">Professional title</Label>
            <Input id="title" name="title" value={form.title ?? profile.title} onChange={handleInputChange} placeholder="Full Stack Developer" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={form.bio ?? profile.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." rows={3} />
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Years of experience</Label>
            <Input id="yearsOfExperience" name="yearsOfExperience" type="number" min="0" max="50" value={form.yearsOfExperience ?? profile.yearsOfExperience} onChange={handleInputChange} />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label>Skills</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill) => (
                <Badge key={skill} variant="outline" className="gap-1">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:bg-accent"><XIcon className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setSkills(skillsInput); setSkillsInput(""); } }}
                placeholder="Add skill (press Enter)"
              />
              <Button variant="outline" onClick={() => { if (skillsInput.trim()) { setSkills(skillsInput); setSkillsInput(""); } }}>Add</Button>
            </div>
          </div>

          <div>
            <Label>Preferred roles</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferredRoles.map((role) => (
                <Badge key={role} variant="secondary" className="gap-1">
                  {role}
                  <button type="button" onClick={() => removePreferredRole(role)} className="ml-1 hover:bg-accent"><XIcon className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={preferredRolesInput}
                onChange={(e) => setPreferredRolesInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setPreferredRole(preferredRolesInput); setPreferredRolesInput(""); } }}
                placeholder="Add role (press Enter)"
              />
              <Button variant="outline" onClick={() => { if (preferredRolesInput.trim()) { setPreferredRole(preferredRolesInput); setPreferredRolesInput(""); } }}>Add</Button>
            </div>
          </div>

          <div>
            <Label>Preferred locations</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {preferredLocations.map((loc) => (
                <Badge key={loc} variant="outline" className="gap-1">
                  {loc}
                  <button type="button" onClick={() => removePreferredLocation(loc)} className="ml-1 hover:bg-accent"><XIcon className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={preferredLocationsInput}
                onChange={(e) => setPreferredLocationsInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); setPreferredLocation(preferredLocationsInput); setPreferredLocationsInput(""); } }}
                placeholder="Add location (press Enter)"
              />
              <Button variant="outline" onClick={() => { if (preferredLocationsInput.trim()) { setPreferredLocation(preferredLocationsInput); setPreferredLocationsInput(""); } }}>Add</Button>
            </div>
          </div>

          <div>
            <Label>Workplace preferences</Label>
            <div className="flex flex-wrap gap-2">
              {WORKPLACE_TYPES.map((type) => (
                <Button
                  key={type}
                  variant={workplacePreferences.includes(type) ? "default" : "outline"}
                  size="sm"
onClick={() => {
                      const updated = workplacePreferences.includes(type)
                        ? workplacePreferences.filter((p) => p !== type)
                        : [...workplacePreferences, type];
                      setForm((prev) => ({ ...prev, workplacePreferences: updated as ("remote" | "hybrid" | "onsite")[] }));
                    }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <Label>Education</Label>
          <div className="space-y-3 mt-2">
            {education.map((edu, i) => (
              <div key={i} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">{edu.fieldOfStudy} · {edu.institution}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear ? `${edu.startYear}` : "—"} – {edu.endYear ? `${edu.endYear}` : "Present"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEducationEdit(i)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleEducationDelete(i)}>Delete</Button>
                </div>
              </div>
            ))}
            {editingEduIndex !== null ? (
              <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <Input
                    placeholder="Degree"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  />
                  <Input
                    placeholder="Field of study"
                    value={eduForm.fieldOfStudy}
                    onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                  />
                  <Input
                    placeholder="Institution"
                    value={eduForm.institution}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                  />
                  <Input
                    placeholder="Start year"
                    type="number"
                    min="1950"
                    max="2100"
                    value={eduForm.startYear}
                    onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                  />
                  <Input
                    placeholder="End year"
                    type="number"
                    min="1950"
                    max="2100"
                    value={eduForm.endYear}
                    onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEducationSave}>
                    {editingEduIndex !== null ? "Save changes" : "Add education"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingEduIndex(null); setEduForm({ degree: "", fieldOfStudy: "", institution: "", startYear: "", endYear: "" }); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setEditingEduIndex(education.length)}>Add education</Button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleSave}>Save profile</Button>
          <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
</CardContent>
      </Card>
  );
}

function calculateCompletion(profile: Profile): number {
  let score = 0;
  if (profile.name) score += 10;
  if (profile.title) score += 15;
  if (profile.skills.length > 0) score += Math.min(25, profile.skills.length * 3);
  if (profile.yearsOfExperience > 0) score += 15;
  if (profile.preferredRoles.length > 0) score += 15;
  if (profile.preferredLocations.length > 0) score += 10;
  if (profile.workplacePreferences.length > 0) score += 10;
  if (profile.education.length > 0) score += 5;
  return Math.min(100, score);
}