export interface Product {
    //detalhes
    status?: string;
    id?: string;
    codigo?: string;
    tipo?: string;
    dormitorios?: number;
    suites?: number;
    finalidade?: string;
    valor_condominio?: string;
    valor_iptu?: string;
    valor?: string;
    //endereco
    endereco?: string;
    bairro?: string;
    //area
    area_util?: number;
    area_total?: number;
    observacao?: string;
    //proprietario
    proprietario?: string;
    telefone?: string;
    celular?: string;
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
    video?: string;
}
