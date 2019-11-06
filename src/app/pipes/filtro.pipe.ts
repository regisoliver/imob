import { Pipe, PipeTransform } from '@angular/core';
import { Product } from '../interfaces/product';

@Pipe({
  name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

  transform( produtos: Product[], texto: string ): Product[] {

    if ( texto.length === 0 ) { return produtos; }

    texto = texto.toLocaleLowerCase();
    console.log("Pipe-Texto: ", texto);
    console.log("Pipe-produtos: ", produtos);

    return produtos.filter( produto => {
      return produto.tipo.toLocaleLowerCase().includes(texto)
             || produto.status.toLocaleLowerCase().includes(texto)
             || produto.bairro.toLocaleLowerCase().includes(texto);
    });

  }

}
