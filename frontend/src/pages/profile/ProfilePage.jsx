import { Mail, Save } from "lucide-react";
import { useState } from "react";
import FormField from "../../components/forms/FormField";
import ProfileImageUpload from "../../components/forms/ProfileImageUpload";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import PageHeader from "../../components/ui/PageHeader";
import UserAvatar from "../../components/ui/UserAvatar";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAuth } from "../../hooks/useAuth";
import { resendVerification } from "../../services/authService";
import { getProfile, updateProfile } from "../../services/profileService";
import { joinCsv, parseCsv } from "../../utils/formatters";
import { getRoleLabel } from "../../utils/roles";

const calculateProfileCompletion = (user, volunteer) => {
  const checks = [
    user?.name,
    user?.email,
    user?.phone,
    user?.location,
    user?.bio,
    user?.interests?.length,
    volunteer?.skills?.length,
    volunteer?.availability,
    user?.avatarUrl
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [success, setSuccess] = useState("");
  const [verificationNotice, setVerificationNotice] = useState("");
  const [verificationError, setVerificationError] = useState("");

  const profileQuery = useApiQuery(getProfile, [], {
    initialData: null,
    onSuccess: (data) => {
      setForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        location: data.user.location || "",
        bio: data.user.bio || "",
        interests: joinCsv(data.user.interests || []),
        avatarUrl: data.user.avatarUrl || "",
        skills: joinCsv(data.volunteer?.skills || []),
        availability: data.volunteer?.availability || "Flexible"
      });
    }
  });

  const updateMutation = useApiMutation(updateProfile, {
    onSuccess: (data) => {
      profileQuery.setData(data);
      setSuccess(
        data.user.isEmailVerified
          ? "Profile updated successfully."
          : "Profile updated. Please verify your email address to keep sign-in access active."
      );
      updateUser({
        ...user,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        isEmailVerified: data.user.isEmailVerified,
        phone: data.user.phone,
        location: data.user.location,
        bio: data.user.bio,
        interests: data.user.interests,
        avatarUrl: data.user.avatarUrl
      });
    }
  });

  const profile = profileQuery.data;
  const loading = profileQuery.isLoading;
  const saving = updateMutation.isLoading;
  const error = profileQuery.error || updateMutation.error;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarUploaded = (avatarUrl) => {
    setForm((current) => ({ ...current, avatarUrl }));

    profileQuery.setData((current) =>
      current
        ? {
            ...current,
            user: {
              ...current.user,
              avatarUrl
            },
            profileCompletion: calculateProfileCompletion(
              { ...current.user, avatarUrl },
              current.volunteer
            )
          }
        : current
    );

    updateUser({
      ...user,
      avatarUrl
    });

    setSuccess("Profile image uploaded successfully.");
  };

  const handleResendVerification = async () => {
    setVerificationError("");
    setVerificationNotice("");

    try {
      const response = await resendVerification(profile.user.email);
      setVerificationNotice(response.message);
    } catch (requestError) {
      setVerificationError(
        requestError.response?.data?.message || "Unable to resend the verification email."
      );
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess("");

    const payload = {
      ...form,
      interests: parseCsv(form.interests),
      skills: parseCsv(form.skills)
    };

    await updateMutation.mutate(payload);
  };

  if (loading) {
    return <LoadingSpinner label="Loading your profile..." />;
  }

  if (!profile || !form) {
    return <EmptyState title="Profile not found" description="We could not load your profile data." />;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile settings"
        description="Keep your contact information, interests, and availability current so the platform can match you with the right opportunities."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <UserAvatar name={profile.user.name} avatarUrl={form.avatarUrl} size="lg" />
            <h2 className="mt-5 font-display text-3xl text-ink">{profile.user.name}</h2>
            <p className="mt-2 text-sm text-slate">{profile.user.email}</p>
            <span className="mt-4 rounded-full bg-tide/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lagoon">
              {getRoleLabel(profile.user.role)}
            </span>

            <div className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate shadow-card">
              {profile.user.isEmailVerified ? "Email Verified" : "Verification Pending"}
            </div>

            <div className="mt-6 w-full rounded-[28px] border border-mist/70 bg-cloud/70 p-5 text-left">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate/70">Profile Completion</p>
                  <p className="mt-2 text-3xl font-extrabold text-ink">{profile.profileCompletion}%</p>
                </div>
              </div>
              <div className="mt-5 h-3 rounded-full bg-white">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-tide to-lagoon"
                  style={{ width: `${profile.profileCompletion}%` }}
                />
              </div>
              <ProfileImageUpload
                name={profile.user.name}
                avatarUrl={form.avatarUrl}
                onUploaded={handleAvatarUploaded}
                className="mt-5"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <FormField label="Full Name" name="name" value={form.name} onChange={handleChange} required />
            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
            <FormField label="Location" name="location" value={form.location} onChange={handleChange} />
            <div className="md:col-span-2">
              <FormField
                label="Bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </div>
            <div className="md:col-span-2">
              <FormField
                label="Interests"
                name="interests"
                value={form.interests}
                onChange={handleChange}
                placeholder="Education, Healthcare, Environment"
              />
            </div>

            {profile.volunteer ? (
              <>
                <div className="md:col-span-2">
                  <FormField
                    label="Skills"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Coordination, Public Speaking, Logistics"
                  />
                </div>
                <FormField
                  label="Availability"
                  type="select"
                  name="availability"
                  value={form.availability}
                  onChange={handleChange}
                  options={[
                    { value: "Flexible", label: "Flexible" },
                    { value: "Weekends", label: "Weekends" },
                    { value: "Evenings", label: "Evenings" },
                    { value: "Weekdays", label: "Weekdays" }
                  ]}
                />
              </>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-[#f6c0b9] bg-[#fff3f1] px-4 py-3 text-sm text-[#b94a38] md:col-span-2">
                {error}
              </div>
            ) : null}

            {!profile.user.isEmailVerified ? (
              <div className="rounded-2xl border border-[#f7dfb7] bg-[#fff8ea] px-4 py-4 text-sm text-[#8c6400] md:col-span-2">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p>
                    Your email is not verified yet. Verify it to keep secure access and password
                    recovery available.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="gap-2"
                    onClick={handleResendVerification}
                  >
                    <Mail size={16} />
                    Resend verification
                  </Button>
                </div>
                {verificationNotice ? <p className="mt-3 text-[#0d5c63]">{verificationNotice}</p> : null}
                {verificationError ? <p className="mt-3 text-[#b94a38]">{verificationError}</p> : null}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-[#b9e5ca] bg-[#effbf4] px-4 py-3 text-sm text-[#137c45] md:col-span-2">
                {success}
              </div>
            ) : null}

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" className="gap-2" isLoading={saving}>
                <Save size={16} />
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
