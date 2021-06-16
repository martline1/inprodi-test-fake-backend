# Inprodi Test Fake API REST Backend

Este es un "backend" falso, para simular cómo sería implementar la comunicación entre la aplicación web desarrollada con **React** y **Redux** con este servicio.

Como desarrolladores frontend, muy comunmente tendremos que trabajar con el código de otras personas que pueden estar trabajando en la misma aplicación web que nosotros o incluso en el servidor de la misma, **estas son un conjunto de rutas API REST** para que el programador implemente posteriormente en el frontend.

## ¿Cómo instalar el proyecto?
1. Clonar repositorio
2. Correr: `npm i`
3. Correr: `npm start`

## Rutas API

| Método | Url | Cuerpo de la petición | Retorno |
| ------ | --- | --------------------- | ------- |
| POST   | http://localhost:4000/api/login | **FormData:** email, password | **token:** de identificación, **user:** información del usuario |
| POST | http://localhost:4000/api/recover_password | **FormData:** email | **token:** para enviar a la hora de resetear la contraseña | 
| POST | http://localhost:4000/api/reset_password | **Bearer token:** el token que te retornó la ruta anterior. **FormData:** password | "ok" código 200 si todo salió bien |

## Notas
Este "backend" no utiliza ningún tipo de base de datos, solamente lo simula con variables de **JavaScript**, todo el código se encuentra en el archivo principal y se puede revisar por si se tiene dudas de su implementación. Se recomienda guardar siempre los tokens que retorna el servidor como medio de identificación y para saber si se tiene una "sesión" iniciada o no, para esto se puediera utilizar **Redux**.
