"use client";

import { ArrowUpRight, CameraOff, ChevronDown, ImageUp, LoaderCircle, RotateCcw, ScanFace } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { todayInBrazil } from "@/lib/dates";
import { type City, CityPicker } from "./city-picker";
import { DatePicker } from "./date-picker";

const VITORIA: City = { id: 918, stateId: 8, name: "Vitória", stateAbbr: "ES" };
const FACE_POLICY_URL = "https://www.focoradical.com.br/conteudo/politica-de-uso-da-facial";
const MAX_SIDE = 1280;

type CameraStatus = "starting" | "live" | "denied" | "unavailable";
type Photo = { blob: Blob; url: string; mirrored: boolean };

const noopSubscribe = () => () => {};

async function toJpeg(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
}

function useCamera(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");

  useEffect(() => {
    if (!enabled) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        setStatus("live");
      } catch (error) {
        if (cancelled) return;
        const name = error instanceof DOMException ? error.name : "";
        setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      setStatus("starting");
    };
  }, [enabled]);

  return { videoRef, status };
}

export function SelfieSearch() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-4 rounded-md border-2 border-ink bg-yellow px-4 py-4 text-left text-ink shadow-[6px_6px_0_var(--color-ink)] transition-[background-color,color,box-shadow,translate] duration-150 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_var(--color-ink)] active:translate-y-0 aria-expanded:bg-ink aria-expanded:text-yellow aria-expanded:shadow-none sm:w-fit sm:gap-5 sm:px-6 sm:py-5"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-yellow group-aria-expanded:bg-yellow group-aria-expanded:text-ink sm:size-16">
          <ScanFace className="size-7 sm:size-9" aria-hidden />
        </span>
        <span className="font-display text-[clamp(1.75rem,7vw,3.5rem)] font-black uppercase leading-[0.88] tracking-tight">
          Achar minhas fotos pela selfie
        </span>
        <ChevronDown
          className="ml-auto size-6 shrink-0 transition-transform duration-200 group-aria-expanded:rotate-180 sm:ml-2 sm:size-7"
          aria-hidden
        />
      </button>
      {open ? <SelfiePanel id={panelId} /> : null}
    </div>
  );
}

function SelfiePanel({ id }: { id: string }) {
  const today = useSyncExternalStore(noopSubscribe, todayInBrazil, () => null);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [city, setCity] = useState<City>(VITORIA);
  const [pickedDate, setPickedDate] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLButtonElement>(null);
  const { videoRef, status } = useCamera(photo === null);
  const date = pickedDate || today || "";
  const fieldId = useId();

  const photoUrl = useRef<string | null>(null);

  function replacePhoto(next: Photo | null) {
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = next?.url ?? null;
    setPhoto(next);
    setError(null);
    if (next) requestAnimationFrame(() => searchRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  useEffect(
    () => () => {
      if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    },
    [],
  );

  async function capture() {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const blob = await toJpeg(video, video.videoWidth, video.videoHeight);
    if (blob) replacePhoto({ blob, url: URL.createObjectURL(blob), mirrored: true });
  }

  async function pickFromGallery(file: File | undefined) {
    if (!file) return;
    try {
      const bitmap = await createImageBitmap(file);
      const blob = await toJpeg(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      if (!blob) throw new Error("toBlob");
      replacePhoto({ blob, url: URL.createObjectURL(blob), mirrored: false });
    } catch {
      setError("Não conseguimos abrir essa foto. Escolha outra ou tire uma selfie.");
    }
  }

  async function search() {
    if (!photo || !date) return;
    setSending(true);
    setError(null);
    const body = new FormData();
    body.append("selfie", photo.blob, "selfie.jpg");
    body.append("cityId", String(city.id));
    body.append("stateId", String(city.stateId));
    body.append("date", date);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    try {
      const res = await fetch("/api/selfie", { method: "POST", body, signal: controller.signal });
      const data: { url?: string; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Não conseguimos enviar a selfie. Tente de novo.");
      window.location.assign(data.url);
    } catch (e) {
      setSending(false);
      setError(
        controller.signal.aborted
          ? "A Foco Radical demorou para responder. Tente de novo."
          : e instanceof TypeError
            ? "Sem conexão. Confira a internet e tente de novo."
            : (e as Error).message,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  const cameraBlocked = !photo && (status === "denied" || status === "unavailable");

  return (
    <div
      id={id}
      role="region"
      aria-label="Busca por selfie"
      className="mt-3 grid gap-5 rounded-md border-2 border-ink bg-paper p-4 text-ink shadow-[6px_6px_0_var(--color-yellow)] animate-[filter-in_200ms_cubic-bezier(0.25,1,0.5,1)] sm:p-5 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-8"
    >
      <div className="mx-auto w-full max-w-[14rem] sm:max-w-[17rem]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-ink text-paper">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob local, o next/image não otimiza
            <img
              src={photo.url}
              alt="Sua selfie"
              className={`size-full object-cover ${photo.mirrored ? "-scale-x-100" : ""}`}
            />
          ) : cameraBlocked ? (
            <div className="flex size-full flex-col items-center justify-center gap-3 p-5 text-center">
              <CameraOff className="size-8 text-yellow" aria-hidden />
              <p className="text-sm text-paper/90">
                {status === "denied"
                  ? "Câmera bloqueada. Libere no ícone ao lado do endereço do site ou use uma foto da galeria."
                  : "Não conseguimos abrir a câmera neste navegador. Use uma foto da galeria."}
              </p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                aria-label="Câmera frontal"
                className={`size-full -scale-x-100 object-cover transition-opacity duration-200 ${status === "live" ? "opacity-100" : "opacity-0"}`}
              />
              {status === "starting" ? (
                <p className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-paper/80" role="status">
                  <LoaderCircle className="size-4 animate-spin" aria-hidden />
                  Abrindo a câmera
                </p>
              ) : (
                <div
                  className="pointer-events-none absolute left-1/2 top-[44%] h-[58%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-yellow/80"
                  aria-hidden
                />
              )}
            </>
          )}

          {photo ? (
            <button
              type="button"
              onClick={() => replacePhoto(null)}
              disabled={sending}
              className="absolute bottom-3 left-1/2 inline-flex h-10 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-ink/80 px-4 text-sm font-semibold text-paper backdrop-blur-sm hover:bg-ink disabled:opacity-50"
            >
              <RotateCcw className="size-4" aria-hidden />
              {photo.mirrored ? "Tirar de novo" : "Trocar foto"}
            </button>
          ) : status === "live" ? (
            <button
              type="button"
              onClick={capture}
              aria-label="Tirar foto"
              className="absolute bottom-3 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-paper/90 transition-transform duration-150 active:scale-95"
            >
              <span className="size-12 rounded-full bg-yellow" aria-hidden />
            </button>
          ) : null}
        </div>

        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            void pickFromGallery(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          disabled={sending}
          className={
            cameraBlocked
              ? "mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-paper hover:bg-ink/85 disabled:opacity-50"
              : "mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold underline decoration-line underline-offset-4 hover:decoration-ink disabled:opacity-50"
          }
        >
          <ImageUp className="size-4" aria-hidden />
          Usar foto da galeria
        </button>
      </div>

      <div className="flex flex-col">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${fieldId}-cidade`} className="mb-1.5 block text-sm font-semibold">
              Cidade
            </label>
            <CityPicker id={`${fieldId}-cidade`} value={city} onChange={setCity} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold" aria-hidden>
              Dia
            </p>
            <DatePicker value={date} onChange={setPickedDate} today={today} clearable={false} />
          </div>
        </div>

        <button
          ref={searchRef}
          type="button"
          onClick={search}
          disabled={!photo || !date || sending}
          aria-describedby={photo ? undefined : `${fieldId}-falta`}
          className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 font-display text-xl font-extrabold uppercase tracking-wide text-yellow transition-colors duration-150 hover:bg-ink/85 disabled:cursor-not-allowed disabled:bg-ink/25 disabled:text-ink/50"
        >
          {sending ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden />
              Enviando selfie
            </>
          ) : (
            <>
              Ver minhas fotos na Foco
              <ArrowUpRight className="size-5" aria-hidden />
            </>
          )}
        </button>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-semibold text-alert">
            {error}
          </p>
        ) : !photo ? (
          <p id={`${fieldId}-falta`} className="mt-2 text-sm text-graphite">
            Tire ou escolha uma selfie para buscar.
          </p>
        ) : null}

        <p className="mt-auto pt-6 text-xs text-graphite">
          A selfie vai para a Foco Radical, que faz o reconhecimento facial.{" "}
          <a
            href={FACE_POLICY_URL}
            target="_blank"
            rel="noopener"
            className="font-semibold text-ink underline decoration-line underline-offset-2 hover:decoration-ink"
          >
            Política de uso da facial
          </a>
        </p>
      </div>
    </div>
  );
}
