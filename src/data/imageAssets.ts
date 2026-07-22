import labSafetyPlaceholder from '../assets/images/lab_safety_group_photo_20260913.placeholder.svg'

export interface RelativeHotspot {
  x: number
  y: number
  width: number
  height: number
}

export interface StoryImageAsset {
  id: string
  placeholderFile: string
  finalFile: string
  title: string
  sceneDescription: string
  narrativePurpose: string
  requiredDetails: string[]
  replacementStatus: 'placeholder' | 'final'
  aspectRatio: string
  hotspots: Record<string, RelativeHotspot>
}

export const LAB_SAFETY_GROUP_PHOTO: StoryImageAsset = {
  id: 'lab_safety_group_photo_20260913',
  placeholderFile: 'lab_safety_group_photo_20260913.placeholder.svg',
  finalFile: 'lab_safety_group_photo_20260913.webp',
  title: '高二年级实验室安全教育活动合影',
  sceneDescription: '近期中国普通高中校园，实验楼前，八名左右穿校服的高中生参加实验室安全教育活动，新闻纪实摄影风格。',
  narrativePurpose: '证明周寻在学校声称退学后的2026年9月13日仍然出现在校园。',
  requiredDetails: ['周寻位于画面右后方', '周寻背深蓝色书包', '书包带有黄色圆形挂件', '画面应像学校官网新闻照片', '人物和环境符合近期中国高中校园', '不得出现文字水印', '不得使用真实学校标志'],
  replacementStatus: 'placeholder',
  aspectRatio: '16:9',
  hotspots: { zhou_xun: { x: 0.78, y: 0.24, width: 0.15, height: 0.62 } },
}

export const storyImageAssets = { [LAB_SAFETY_GROUP_PHOTO.id]: LAB_SAFETY_GROUP_PHOTO } as const

const currentSources: Record<string, string> = {
  [LAB_SAFETY_GROUP_PHOTO.id]: labSafetyPlaceholder,
}

export function resolveStoryImageSource(asset: StoryImageAsset): string {
  return currentSources[asset.id]
}

export function hotspotStyle(hotspot: RelativeHotspot) {
  return { left: `${hotspot.x * 100}%`, top: `${hotspot.y * 100}%`, width: `${hotspot.width * 100}%`, height: `${hotspot.height * 100}%` }
}
