"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function Scholarship() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [tenth, setTenth] = useState("");
  const [twelfth, setTwelfth] = useState("");
  const [aadhar, setAadhar] = useState(null);
  const [tenthCertificate, setTenthCertificate] = useState(null);
  const [twelfthCertificate, setTwelfthCertificate] = useState(null);
  const [error, setError] = useState("");

  const getUserId = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user:", error.message);
      return null;
    }
    return user ? user.id : null;
  };

const handleFileUpload = async (file, folderName) => {
  const userId = await getUserId();
  if (!userId) {
    setError("User not authenticated");
    return null;
  }

  const fileName = `${folderName}/${userId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, file);

  if (error) {
    setError(error.message);
    console.error("Error uploading file: ", error.message);
    return null;
  }

  const { data: publicUrlData, error: urlError } = supabase.storage
    .from("documents")
    .getPublicUrl(fileName);

  if (urlError) {
    setError(urlError.message);
    console.error("Error getting public URL: ", urlError.message);
    return null;
  }

  return publicUrlData.publicUrl;
};


  const handleApplication = async (e) => {
    e.preventDefault();

    setLoading(true);

    const aadharUrl = await handleFileUpload(aadhar, "aadhar card");  
    const tenthCertUrl = await handleFileUpload(tenthCertificate, "10th certificates");
    const twelfthCertUrl =  await handleFileUpload(twelfthCertificate, "12th certificates");

      console.log(aadharUrl, tenthCertUrl, twelfthCertUrl);

    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          name,
          phone,
          email,
          reason,
          "10th percentage": tenth,
          "12th percentage": twelfth,
          "aadhar card": aadharUrl,
          "10th marksheet": tenthCertUrl,
          "12th marksheet": twelfthCertUrl,
          status: "verified",
        },
      ]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      console.log("Application submitted successfully");
    }
  };

  return (
    <>
    {loading ? (<div>Loading...</div>) : (
    <div className="container mx-auto max-w-3xl py-12 px-4 md:px-0">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Scholarship Application</h1>
        <p className="text-muted-foreground">
          Apply for our prestigious scholarship program and take the next step
          towards your educational goals.
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleApplication}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Applying</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you deserve this scholarship"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tenth">10th Percentage</Label>
            <Input
              id="tenth"
              type="number"
              value={tenth}
              onChange={(e) => setTenth(e.target.value)}
              placeholder="Enter your 10th percentage"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twelfth">12th Percentage</Label>
            <Input
              id="twelfth"
              type="number"
              value={twelfth}
              onChange={(e) => setTwelfth(e.target.value)}
              placeholder="Enter your 12th percentage"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Upload Documents</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhar Card</Label>
              <Input
                id="aadhar"
                type="file"
                onChange={(e) => setAadhar(e.target.files[0])}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenth-certificate">10th Certificate</Label>
              <Input
                id="tenth-certificate"
                type="file"
                onChange={(e) => setTenthCertificate(e.target.files[0])}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twelfth-certificate">12th Certificate</Label>
              <Input
                id="twelfth-certificate"
                type="file"
                onChange={(e) => setTwelfthCertificate(e.target.files[0])}
                required
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <div className="flex justify-end">
          <Button type="submit">Submit Application</Button>
        </div>
      </form>
    </div>)}
    </>
  );
}
