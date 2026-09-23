import { useQuery } from "@tanstack/react-query";

import { enderecosApi } from "@/lib/api";

/** Lista os municípios da UF informada (IBGE). Desabilitada até haver UF. */
export function useMunicipios(uf: string | undefined) {
  return useQuery({
    queryKey: ["municipios", uf],
    queryFn: () => enderecosApi.listarMunicipios(uf as string),
    enabled: Boolean(uf && uf.length === 2),
    staleTime: 24 * 60 * 60 * 1000, // municípios de uma UF não mudam durante a sessão
  });
}
