import { z } from "zod";
import { addDays, todayInBrazil } from "@/lib/dates";
import { quickSearchUrl, uploadSelfie } from "@/lib/foco-selfie";

// O cliente já reduz a foto para 1280 px em JPEG (~200 KB); o teto fica abaixo do limite de corpo da Vercel.
const MAX_BYTES = 4 * 1024 * 1024;

const Fields = z.object({
  cityId: z.coerce.number().int().positive(),
  stateId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function fail(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Envio inválido. Tire a selfie de novo.");
  }

  const selfie = form.get("selfie");
  if (!(selfie instanceof Blob) || selfie.size === 0) return fail(400, "Faltou a selfie.");
  if (selfie.size > MAX_BYTES) return fail(413, "A foto ficou grande demais. Tire a selfie de novo.");
  if (selfie.type !== "image/jpeg") return fail(415, "Formato de foto não aceito. Tire a selfie de novo.");

  const fields = Fields.safeParse({
    cityId: form.get("cityId"),
    stateId: form.get("stateId"),
    date: form.get("date"),
  });
  if (!fields.success) return fail(400, "Escolha a cidade e a data da busca.");
  // Folga de um dia para quem está num fuso à frente de Brasília.
  if (fields.data.date > addDays(todayInBrazil(), 1)) return fail(400, "A data não pode ser no futuro.");

  try {
    const imageId = await uploadSelfie(selfie);
    return Response.json({ url: quickSearchUrl({ ...fields.data, imageId }) });
  } catch (error) {
    console.error("[selfie] falha ao enviar para a Foco:", error);
    return fail(502, "A Foco Radical não respondeu. Tente de novo em alguns segundos.");
  }
}
