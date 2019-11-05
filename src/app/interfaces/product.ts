export interface Product {
    //detalhes
    status?: string;
    id?: string;
    codigo?: string;
    tipo?: string;
    dormitorios?: number;
    suites?: number;
    finalidade?: string;
    valor_condominio?: number;
    valor_iptu?: number;
    valor?: number;
    //endereco
    endereco?: string;
    bairro?: string;
    //area
    area_util?: number;
    area_total?: number;
    observacao?: string;
    //proprietario
    proprietario?: string;
    telefone?: number;
    permuta?: string;
    aniversario?: number;
    canal?: string;
    visitas?: string;
    //produto
    picture?: string
    data_entrada?: number;
    corretor?: string;
    obs?: string;
    detalhe_um?: boolean;
    detalhe_dois?: boolean;
    detalhe_tres?: boolean;
    images?: Array<String>;
}
