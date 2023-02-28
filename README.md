# Control de precios

This project is a CRM practice, for merge Oxi-Mercedes S.A. sistem, with TiendaNube and Mercadolibre.
The project tries to group several tools of common use in the day to day, at the same time that it has a synchronization system between the 3 Stock and the 3 Price Lists (In the 3 platforms)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.3.
Esta pensada para poder ser usada de forma local como un ejecutable para windows (peticion de la empresa)
O si es necesario, pasar a hostear en linea.
Utiliza un backend a medida y una base de datos MySQL.
Como uso principal, la app esta pensada para que permita llevar un seguimiento de los precios en las plataformas online, ya que el sistema de facturacion y stock local
es antiguo y la empresa no quiere migrar. en el caso de el sistema local y web, se utiliza carga de CSV para actualizar datos y exportar. en la seccion Mercadolibre, se utilizara la API de desarrollo de la plataforma, de esta manera permitir la administracion de precios, y stock.


## Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
