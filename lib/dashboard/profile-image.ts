import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";

export const profileImageMaxSize = 5 * 1024 * 1024;
export const profileImageAcceptedTypes = ["image/png", "image/jpeg"] as const;

const profileImagesDirectory = path.join(
  process.cwd(),
  "public",
  "images",
  "profile",
);

export function isAcceptedProfileImageType(
  type: string,
): type is (typeof profileImageAcceptedTypes)[number] {
  return profileImageAcceptedTypes.some((acceptedType) => acceptedType === type);
}

export function getProfileImagePublicPath(userId: string) {
  return `/images/profile/${userId}.png`;
}

export function getVersionedProfileImagePath(userId: string) {
  return `${getProfileImagePublicPath(userId)}?v=${Date.now()}`;
}

export async function saveProfileImageFile(userId: string, file: File) {
  await mkdir(profileImagesDirectory, { recursive: true });

  const filePath = path.join(profileImagesDirectory, `${userId}.png`);
  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, buffer);
}

export async function deleteProfileImageFile(
  profileImagePath: string | null | undefined,
) {
  if (!profileImagePath) {
    return;
  }

  const profileUrl = new URL(profileImagePath, "http://localhost");

  if (!profileUrl.pathname.startsWith("/images/profile/")) {
    return;
  }

  const fileName = path.basename(profileUrl.pathname);

  if (!fileName || fileName !== path.basename(fileName)) {
    return;
  }

  try {
    await unlink(path.join(profileImagesDirectory, fileName));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}
