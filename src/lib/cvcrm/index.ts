// Superfície pública da integração com o CVCRM.

export { configCvcrm, ROTAS, ORIGENS_CV, CAMPOS_ADICIONAIS_PADRAO } from "./config";
export type { ConfigCvcrm, ChaveCampoAdicional } from "./config";
export { chamadaRest, chamadaCvdw, paginaCvdw, paginaRest, ErroCvcrm } from "./http";
export { leCamposAdicionais, montaCamposAdicionais, origemCv, midiaCv, conversaoCv } from "./campos";
export {
  enviaLeadParaCrm,
  buscaLeadCrm,
  listaLeadsCrm,
  leadParaEvento,
  etapaDoLead,
  refDoRegistro,
} from "./leads";
export {
  listaVendasCrm,
  reservaParaEvento,
  etapaDaReserva,
  valorDaReserva,
  leadsDaReserva,
  chaveLeadCv,
} from "./vendas";
export { pega, texto, paraIso, paraNumero, listaIds } from "./util";
