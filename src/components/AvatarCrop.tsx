"use client"
import { useUser } from '@/store'
import { showToast } from '@/utils'
import axios, { AxiosError } from 'axios'
import React, { useState, useRef, useEffect, DependencyList } from 'react'
import Checkbox from '@mui/material/Checkbox';
import { green } from '@mui/material/colors';
import ReactCrop, { centerCrop, makeAspectCrop, convertToPixelCrop, type Crop, type PixelCrop, } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { ContinuousSlider } from './MUIs'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number,) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth, mediaHeight
    )
}
const TO_RADIANS = Math.PI / 180
async function canvasPreview(image: HTMLImageElement, canvas: HTMLCanvasElement, crop: PixelCrop, scale = 1, rotate = 0) {
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    // devicePixelRatio slightly increases sharpness on retina devices
    // at the expense of slightly slower render times and needing to
    // size the image back down if you want to download/upload and be
    // true to the images natural size.
    const pixelRatio = window.devicePixelRatio
    // const pixelRatio = 1

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    const rotateRads = rotate * TO_RADIANS
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY)
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY)
    // 3) Rotate around the origin
    ctx.rotate(rotateRads)
    // 2) Scale the image
    ctx.scale(scale, scale)
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight)
    ctx.restore()
}
function useDebounceEffect(fn: () => void, waitTime: number, deps: DependencyList) {
    useEffect(() => {
        const t = setTimeout(() => {
            fn.apply(undefined, deps as any)
        }, waitTime)

        return () => {
            clearTimeout(t)
        }
    }, deps)
}
export default function AvatarCrop({ params: { avatarFile, closeModal, callback, api } }: { params: { avatarFile: File, closeModal: () => void, callback: (data: any) => void, api: string } }) {
    const [step, setStep] = useState(1)
    const { setToken } = useUser()
    const [sendingRequest, setSendingRequest] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [imgSrc, setImgSrc] = useState('')
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement>(null)
    const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [scale, setScale] = useState(1)
    const [rotate, setRotate] = useState(0)
    const [aspect, setAspect] = useState<number | undefined>(/* 16 / 9 */ 1)

    useEffect(() => {
        const reader = new FileReader()
        reader.addEventListener('load', () =>
            setImgSrc(reader.result?.toString() || ''),
        )
        reader.readAsDataURL(avatarFile)
    }, [])

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    async function uploadAvatar() {
        const image = imgRef.current
        const previewCanvas = previewCanvasRef.current
        if (!image || !previewCanvas || !completedCrop) {
            throw new Error('Crop canvas does not exist')
        }

        // This will size relative to the uploaded image
        // size. If you want to size according to what they
        // are looking at on screen, remove scaleX + scaleY
        const scaleX = image.naturalWidth / image.width
        const scaleY = image.naturalHeight / image.height

        const offscreen = new OffscreenCanvas(
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
        )
        const ctx = offscreen.getContext('2d')
        if (!ctx) {
            throw new Error('No 2d context')
        }

        ctx.drawImage(previewCanvas, 0, 0, previewCanvas.width, previewCanvas.height, 0, 0, offscreen.width, offscreen.height)
        const blob = await offscreen.convertToBlob({ type: "image/jpeg", quality: 0.7 })

        const formData = new FormData()
        formData.append('file', blob, "file.jpg");
        setSendingRequest(true)
        axios.post(api, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                token: localStorage.getItem("jwt")
            },
            onUploadProgress: progressEvent => {
                const { loaded, total } = progressEvent;
                if (!total) return
                const percentCompleted = Math.round((loaded * 100) / total);
                setUploadProgress(percentCompleted)
                console.log(`Upload progress: ${percentCompleted}% (${loaded} bytes of ${total} bytes)`);
            }
        }).then(({ data }) => {
            callback(data)
            closeModal()
        }).catch((e: AxiosError) => {
            showToast(e.response?.statusText || "Unknown Error", "error")
        }).finally(() => {
            setSendingRequest(false)
            setUploadProgress(0)
        })

        // if (blobUrlRef.current) {
        //     URL.revokeObjectURL(blobUrlRef.current)
        // }
        // blobUrlRef.current = URL.createObjectURL(blob)

        // if (hiddenAnchorRef.current) {
        //     hiddenAnchorRef.current.href = blobUrlRef.current
        //     hiddenAnchorRef.current.click()
        // }
    }

    useDebounceEffect(
        async () => {
            if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
                // We use canvasPreview as it's much faster than imgPreview.
                canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate)
            }
        },
        100,
        [completedCrop, scale, rotate]
    )

    function handleToggleAspectClick() {
        if (aspect) {
            setAspect(undefined)
        } else {
            setAspect(/* 16 / 9 */ 1)

            if (imgRef.current) {
                const { width, height } = imgRef.current
                const newCrop = centerAspectCrop(width, height, /* 16 / 9 */ 1)
                setCrop(newCrop)
                // Updates the preview
                setCompletedCrop(convertToPixelCrop(newCrop, width, height))
            }
        }
    }

    return (
        <div className='pb-8'>
            <button className='cursor-pointer underline' onClick={closeModal}>Back</button>
            <p className='w-full text-center text-2xl'>
                Crop Image And Upload
            </p>
            {!!imgSrc &&
                <div className={`${step !== 1 && "hidden"}`}>
                    <div>
                        <div className='flex items-center gap-8'>
                            <p className="w-10">Scale: </p>
                            <ContinuousSlider value={scale} setValue={setScale} min={1} max={10} />
                            <span>{scale}</span>
                        </div>
                        <div className='flex items-center gap-8'>
                            <p className="w-10">Rotate: </p>
                            <ContinuousSlider value={rotate} setValue={setRotate} min={-180} max={180} />
                            <span>{rotate}</span>
                        </div>
                        <div>
                            <span>Keep aspect ratio:</span>
                            <Checkbox onClick={handleToggleAspectClick} color="success" sx={{ color: green[800], '&.Mui-checked': { color: green[600] } }} />
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            // minWidth={400}
                            minHeight={10}
                        // circularCrop
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={imgSrc}
                                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    </div>
                    <div>
                        <button onClick={() => setStep(2)} className="max-md:col-span-2 w-full py-[14px] max-md:py-[6px] rounded-[10px] border border-[#364153] text-white bg-[#14679F] hover:bg-[#3c85b6] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            }
            {!!completedCrop &&
                <div className={`${step !== 2 && "hidden"}`}>
                    <div className='w-full flex justify-center py-10'>
                        <canvas
                            className='rounded-full w-80 h-80'
                            ref={previewCanvasRef}
                            style={{
                                border: '1px solid black',
                                objectFit: 'contain',
                                // width: completedCrop.width,
                                // height: completedCrop.height,
                            }}
                        />
                    </div>
                    {uploadProgress > 0 &&
                        <div className='w-full py-4'>
                            <div className="w-full h-2 rounded-full bg-[#1E2939]">
                                <div className="h-2 rounded-full bg-[#F08105]" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                        </div>
                    }
                    {/* <div>
                        <button onClick={uploadAvatar}>Download Crop</button>
                        <a download href="#hidden" ref={hiddenAnchorRef} style={{ position: 'absolute', top: '-200vh', visibility: 'hidden', }}>
                            Hidden download
                        </a>
                    </div> */}
                    <div className='w-full flex gap-4'>
                        <button onClick={() => setStep(1)} className="max-md:col-span-2 w-full py-[14px] max-md:py-[6px] rounded-[10px] border border-[#364153] text-white bg-[#14679F] hover:bg-[#3c85b6] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                            Back
                        </button>
                        <button onClick={uploadAvatar} className="max-md:col-span-2 w-full py-[14px] max-md:py-[6px] rounded-[10px] border border-[#364153] text-white bg-[#14679F] hover:bg-[#3c85b6] text-[14px] font-semibold cursor-pointer disabled:cursor-not-allowed" disabled={sendingRequest}>
                            Upload
                        </button>
                    </div>
                </div>
            }
        </div>
    )
}
