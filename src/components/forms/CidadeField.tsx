import { useWatch, type Control, type FieldPath, type FieldValues } from "react-hook-form";

import { useMunicipios } from "@/hooks/use-municipios";
import { SelectField } from "./fields";

export function CidadeField<T extends FieldValues>({
  control,
  name,
  uf,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  /** Sigla do estado selecionado — a lista de municípios depende dela. */
  uf: string | undefined;
}) {
  const municipiosQuery = useMunicipios(uf);
  const municipios = municipiosQuery.data ?? [];
  const valorAtual = useWatch({ control, name }) as string | undefined;

  // Garante que o valor atual sempre tenha um item correspondente, mesmo
  // antes da lista terminar de carregar (ex.: logo após o preenchimento
  // automático pelo CEP).
  const opcoesNomes =
    valorAtual && !municipios.includes(valorAtual)
      ? [valorAtual, ...municipios]
      : municipios;

  const placeholder = !uf
    ? "Selecione o estado primeiro"
    : municipiosQuery.isLoading
      ? "Carregando…"
      : "Selecione…";

  return (
    <SelectField
      control={control}
      name={name}
      label="Cidade"
      placeholder={placeholder}
      options={opcoesNomes.map((cidade) => ({ value: cidade, label: cidade }))}
      enabled={Boolean(uf) && !municipiosQuery.isLoading}
      hint={
        municipiosQuery.isError
          ? "Não foi possível carregar os municípios agora."
          : undefined
      }
    />
  );
}
