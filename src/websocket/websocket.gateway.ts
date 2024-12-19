import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer as WsServer,
} from '@nestjs/websockets';
import * as WebSocket from 'ws';

interface Usuario {
  id: string;
  nombre: string;
  clientWs: WebSocket;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WsServer()
  server: WebSocket.Server;
  private usuarios: Usuario[] = [];

  handleConnection(client: WebSocket) {
    const usuario: Usuario = {
      id: this.generarId(),
      nombre: `Usuario_${Math.floor(Math.random() * 1000)}`,
      clientWs: client,
    };

    this.usuarios.push(usuario);
    console.log(`¡Nuevo usuario conectado! ID: ${usuario.id}`);

    client.send(
      JSON.stringify({
        tipo: 'conexion',
        data: { id: usuario.id, nombre: usuario.nombre },
      }),
    );

    client.on('message', (message: string) => {
      const mensajeData = JSON.parse(message.toString());
      console.log('Mensaje recibido:', mensajeData);

      if (mensajeData.tipo === 'mensaje-chat-general') {
        // Broadcast a todos menos al emisor
        this.usuarios.forEach((u) => {
          if (u.id !== usuario.id && u.clientWs.readyState === WebSocket.OPEN) {
            u.clientWs.send(
              JSON.stringify({
                tipo: 'mensaje-servidor',
                data: {
                  ...mensajeData.data,
                  usuario: usuario.nombre,
                },
              }),
            );
          }
        });
      }
    });
  }

  handleDisconnect(client: WebSocket) {
    const usuarioDesconectado = this.usuarios.find(
      (u) => u.clientWs === client,
    );
    if (usuarioDesconectado) {
      console.log(`Usuario desconectado: ${usuarioDesconectado.nombre}`);
      this.usuarios = this.usuarios.filter((u) => u.clientWs !== client);
    }
  }

  private generarId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
