export interface Product {
    id?: string;
    CODIGO?: string;
    ENDERECO?: string;
    BAIRRO?: string;
    AREA_UTIL?: string;
    AREA_TOTAL?: string;
    VALOR?: string;
    PERMUTA?: string;
    OBSERVACAO?: string;
    DORMITORIOS?: number;
    SUITES?: number;
    TIPO?: string;
    VALOR_CONDOMINIO?: string;
    VALOR_IPTU?: string;
    FINALIDADE?: string;
    VISITAS?: string;
    PROPRIETARIO?: string;
    TELEFONE?: number;
    DATA_ENTRADA?: Date;
    CANAL?: string;
    CORRETOR?: string;
    STATUS?: string;
    OBS?: string;

    picture: string;
}
