"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Camera, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/use-users";
import { mediaService } from "@/lib/services/media.service";
import type { UserProfile } from "@/lib/mock-data/profile";

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự").max(100),
  bio: z.string().max(500).optional().nullable(),
  hometown: z.string().max(120).optional().nullable(),
  education: z.string().max(255).optional().nullable(),
  maritalStatus: z.string().max(50).optional().nullable(),
  gender: z.string().max(50).optional().nullable(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
}

export function ProfileEditModal({ isOpen, onOpenChange, profile }: ProfileEditModalProps) {
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.coverUrl);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      hometown: profile.hometown || "",
      education: profile.education || "",
      maritalStatus: profile.maritalStatus || "",
      gender: profile.gender || "",
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      let finalAvatarId: string | undefined;
      let finalCoverId: string | undefined;

      // Upload avatar if changed
      if (avatarFile) {
        setIsUploadingAvatar(true);
        finalAvatarId = await mediaService.upload(avatarFile, "IMAGE");
        setIsUploadingAvatar(false);
      }

      // Upload cover if changed
      if (coverFile) {
        setIsUploadingCover(true);
        finalCoverId = await mediaService.upload(coverFile, "IMAGE");
        setIsUploadingCover(false);
      }

      // Submit all changes mapped correctly
      updateProfile.mutate(
        {
          displayName: values.displayName || undefined,
          bio: values.bio || undefined,
          hometown: values.hometown || undefined,
          education: values.education || undefined,
          maritalStatus: values.maritalStatus || undefined,
          gender: values.gender || undefined,
          ...(finalAvatarId ? { avatarMediaId: finalAvatarId } : {}),
          ...(finalCoverId ? { coverMediaId: finalCoverId } : {}),
        },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset(values);
          },
        }
      );
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Lỗi cập nhật ảnh!");
      setIsUploadingAvatar(false);
      setIsUploadingCover(false);
    }
  };

  const isLoading = updateProfile.isPending || isUploadingAvatar || isUploadingCover;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh] p-0 gap-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">Chỉnh sửa trang cá nhân</DialogTitle>
          <DialogDescription className="hidden">Update your profile info</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="px-6 space-y-6">
              {/* Cover Photo */}
              <div className="space-y-3 pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Ảnh bìa</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-primary hover:text-primary/90 h-8 px-2"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Thêm
                  </Button>
                </div>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="h-40 w-full rounded-xl bg-muted relative overflow-hidden flex items-center justify-center border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors group"
                >
                  {coverPreview ? (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-sm">Tải ảnh bìa lên</span>
                    </div>
                  )}
                  {isUploadingCover && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  )}
                  <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
                </div>
              </div>

              {/* Avatar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Ảnh đại diện</h3>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-primary hover:text-primary/90 h-8 px-2"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    Thêm
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative group cursor-pointer"
                  >
                    <Avatar className="h-32 w-32 md:h-[140px] md:w-[140px] rounded-full">
                      <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                      <AvatarFallback className="text-3xl bg-secondary">{form.getValues().displayName?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-background/50 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    )}
                    <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="font-semibold text-lg mb-2">Thông tin cơ bản</h3>
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên hiển thị</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên thật của bạn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tiểu sử</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mô tả ngắn gọn về bản thân..." className="resize-none h-20" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Học vấn</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Đại học Bách Khoa" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hometown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quê quán</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Hà Nội" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới tính</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Nam</SelectItem>
                          <SelectItem value="FEMALE">Nữ</SelectItem>
                          <SelectItem value="OTHER">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tình trạng hôn nhân</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn tình trạng hôn nhân" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Độc thân">Độc thân</SelectItem>
                          <SelectItem value="Đang hẹn hò">Đang hẹn hò</SelectItem>
                          <SelectItem value="Đã kết hôn">Đã kết hôn</SelectItem>
                          <SelectItem value="Đã ly hôn">Đã ly hôn</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/40 mt-6 sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2 px-8 min-w-[120px]">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </DialogFooter>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
