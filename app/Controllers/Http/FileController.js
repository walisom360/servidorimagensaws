'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Drive = use('Drive');
const File = use('App/Models/File');

class FileController {
  async index({ request, response, view }) {}

  async create({ request, response, view }) {}

  async store({ request, response }) {
    request.multipart
      .file('image', {}, async file => {
        try {
          const ContentType = file.headers['content-type'];
          const ACL = 'public-read';
          const Key = `${(Math.random() * 100).toString(32)}-${
            file.clientName
          }`;

          const url = await Drive.put(Key, file.stream, {
            ContentType,
            ACL
          });

          await File.create({
            name: file.clientName,
            key: Key,
            url,
            content_type: ContentType
          });
        } catch (err) {
          return response.status(err.status).json({
            error: {
              message: 'não foi possivel enviar o arquivo',
              err_message: err.message
            }
          });
        }
      })
      .process();
  }

  async show({ params, request, response, view }) {
    const { id: name } = params;

    try {
      const file = await File.findByOrFail('name', name);

      response.implicitEnd = false;
      response.header('Content-Type', file.content_type);

      const stream = await Drive.getStream(file.key);

      stream.pipe(response.response);
    } catch (err) {
      return response.status(err.status).json({
        error: {
          message: 'Arquivo Não existe',
          err_message: err.message
        }
      });
    }
  }

  async edit({ params, request, response, view }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {
    const { id: name } = params;

    try {
      const file = await File.findByOrFail('name', name);

      await Drive.delete(file.key);

      await file.delete();
    } catch (err) {
      return response.status(err.status).json({
        error: {
          message: 'Arquivo Não pode ser excluido',
          err_message: err.message
        }
      });
    }
  }
}

module.exports = FileController;
