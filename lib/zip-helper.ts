/**
 * Utilitaires pour créer et télécharger des fichiers ZIP
 */

import JSZip from "jszip"

export type FileToZip = {
  name: string
  blob: Blob
}

/**
 * Crée un fichier ZIP contenant plusieurs fichiers
 * @param files - Liste des fichiers à inclure dans le ZIP
 * @returns Blob contenant le fichier ZIP
 */
export async function createZipFromBlobs(
  files: FileToZip[]
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error("Aucun fichier à compresser")
  }

  const zip = new JSZip()

  // Ajouter chaque fichier au ZIP
  for (const file of files) {
    zip.file(file.name, file.blob)
  }

  // Générer le ZIP
  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6, // Niveau de compression (0-9)
    },
  })

  return zipBlob
}

/**
 * Télécharge un fichier Blob
 * @param blob - Le Blob à télécharger
 * @param filename - Nom du fichier
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

/**
 * Crée et télécharge un fichier ZIP contenant plusieurs fichiers
 * @param files - Liste des fichiers à inclure
 * @param zipFilename - Nom du fichier ZIP à créer
 */
export async function createAndDownloadZip(
  files: FileToZip[],
  zipFilename: string
): Promise<void> {
  const zipBlob = await createZipFromBlobs(files)
  downloadBlob(zipBlob, zipFilename)
}
