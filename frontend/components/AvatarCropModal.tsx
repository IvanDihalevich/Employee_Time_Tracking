'use client'

import { useCallback, useMemo, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useLanguage } from '@/lib/contexts/LanguageContext'

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image-load-failed'))
    img.src = src
  })
}

function dataUrlByteSize(dataUrl: string): number {
  const idx = dataUrl.indexOf('base64,')
  if (idx === -1) return dataUrl.length
  const base64 = dataUrl.slice(idx + 'base64,'.length)
  // base64 length -> bytes
  return Math.floor((base64.length * 3) / 4)
}

async function cropToDataUrl(inputDataUrl: string, area: Area, size = 256): Promise<string> {
  const img = await loadImage(inputDataUrl)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('no-canvas')

  // draw cropped region to square canvas
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size
  )

  // Prefer WEBP; fallback to JPEG
  let quality = 0.9
  let out = canvas.toDataURL('image/webp', quality)
  if (!out.startsWith('data:image/webp')) {
    out = canvas.toDataURL('image/jpeg', quality)
  }

  // compress until <= 220KB
  const maxBytes = 220 * 1024
  while (dataUrlByteSize(out) > maxBytes && quality > 0.4) {
    quality -= 0.08
    const mime = out.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'
    out = canvas.toDataURL(mime, quality)
  }

  return out
}

export default function AvatarCropModal({
  src,
  onCancel,
  onSave,
}: {
  src: string
  onCancel: () => void
  onSave: (dataUrl: string) => void
}) {
  const { t } = useLanguage()
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const canSave = useMemo(() => Boolean(croppedAreaPixels) && !saving, [croppedAreaPixels, saving])

  const handleSave = async () => {
    if (!croppedAreaPixels) return
    setSaving(true)
    setError('')
    try {
      const out = await cropToDataUrl(src, croppedAreaPixels, 256)
      onSave(out)
    } catch {
      setError(t('profile.avatarError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/55 p-4 backdrop-blur-sm">
      <div className="card-surface w-full max-w-xl overflow-hidden shadow-card-lg">
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-4">
          <div className="font-display text-lg font-bold text-slate-900">{t('profile.cropAvatarTitle')}</div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-500 hover:bg-slate-100"
            aria-label={t('common.cancel')}
          >
            ×
          </button>
        </div>

        <div className="p-5">
          <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/90">
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">{t('profile.zoom')}</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

