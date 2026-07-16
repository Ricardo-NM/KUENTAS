import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getPrisma } from "@/lib/prisma";
import {
  deleteProfileImageFile,
  getVersionedProfileImagePath,
  isAcceptedProfileImageType,
  profileImageMaxSize,
  saveProfileImageFile,
} from "@/lib/dashboard/profile-image";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireSession();
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { messageKey: "dashboard.settings.profile.photo.feedback.invalidFile" },
      { status: 400 },
    );
  }

  if (!isAcceptedProfileImageType(file.type)) {
    return NextResponse.json(
      { messageKey: "dashboard.settings.profile.photo.feedback.invalidType" },
      { status: 400 },
    );
  }

  if (file.size > profileImageMaxSize) {
    return NextResponse.json(
      { messageKey: "dashboard.settings.profile.photo.feedback.tooLarge" },
      { status: 400 },
    );
  }

  const currentUser = await getPrisma().user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      profileImagePath: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json(
      { messageKey: "dashboard.settings.profile.photo.feedback.saveFailed" },
      { status: 404 },
    );
  }

  await saveProfileImageFile(session.userId, file);

  const profileImagePath = getVersionedProfileImagePath(session.userId);

  await getPrisma().user.update({
    where: {
      id: session.userId,
    },
    data: {
      profileImagePath,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/configuracion");

  return NextResponse.json({ profileImagePath });
}

export async function DELETE() {
  const session = await requireSession();
  const currentUser = await getPrisma().user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      profileImagePath: true,
    },
  });

  if (!currentUser) {
    return NextResponse.json(
      { messageKey: "dashboard.settings.profile.photo.feedback.deleteFailed" },
      { status: 404 },
    );
  }

  await deleteProfileImageFile(currentUser.profileImagePath);

  await getPrisma().user.update({
    where: {
      id: session.userId,
    },
    data: {
      profileImagePath: null,
    },
    select: {
      id: true,
    },
  });

  revalidatePath("/configuracion");

  return NextResponse.json({ profileImagePath: null });
}
