<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\NotFoundHttpException;
use yii\helpers\BaseFileHelper;
use app\base\Common;
use app\models\Registration;

/**
 * AjaxController implements the CRUD actions for Sections model.
 */
class AjaxController extends Controller
{
    public function actionDownload($id)
    {
        $filename = "";
        $model = Registration::find()->where(["corfrm_pid" => $id])->one();
        if($model === null)
            throw new NotFoundHttpException('The requested file does not exist.');
        $filepath = Yii::getAlias('@root') . DIRECTORY_SEPARATOR . Yii::$app->params["artbookPath"] . DIRECTORY_SEPARATOR;
        $filename = $model->corfrm_pid;
        $file_name = $filepath.$filename;
        $download_file_name = $filename;

        if (file_exists($file_name))
            return Yii::$app->response->sendFile($file_name, $filename, ['inline' => true]);
        else
            throw new NotFoundHttpException('The requested file does not exist.');
        exit;

        // make sure it's a file before doing anything!
        if(is_file($file_name))
        {
            // required for IE
            if(ini_get('zlib.output_compression')) { ini_set('zlib.output_compression', 'Off'); }

            // get the file mime type using the file extension
            switch(strtolower(substr(strrchr($file_name,'.'),1)))
            {
                case 'pdf': $mime = 'application/pdf'; break;
                case 'doc': $mime = 'application/msword'; break;
                case 'zip': $mime = 'application/zip'; break;
                case 'jpeg':
                case 'jpg': $mime = 'image/jpg'; break;
                default: $mime = 'application/force-download';
            }
            $mime = BaseFileHelper::getMimeType($file_name);
            header('Pragma: public');   // required
            header('Expires: 0');       // no cache
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Cache-Control: private',false);
            header('Content-Type: '.$mime);
            // header('Content-Disposition: attachment; filename="'.basename($download_file_name).'"');
            header('Content-Transfer-Encoding: binary');
            header('Content-Length: '.filesize($file_name));    // provide file size
            readfile($file_name);       // push it out
        }
        else
            throw new NotFoundHttpException('The requested file does not exist.');
    }

    public function actionGetid()
    {
        $request = Yii::$app->request;
        if ($request->isGet) {
            $sur = $request->get('sur');
            $loc = $request->get('loc');
        }
        if ($request->isPost) {
            $sur = $request->post('sur');
            $loc = $request->post('loc');
        }
        return Common::getClientid($sur, $loc);
    }
}
