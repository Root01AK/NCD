<?php

namespace app\controllers;

use Yii;
use app\base\Model;
use yii\web\Controller;
use yii\web\UploadedFile;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\ImportForm;
use app\models\DynamicModel;

/**
 * ExportController implements the CRUD actions for Export model.
 */
class ImportController extends Controller
{
    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['error'],
                        'allow' => true,
                    ],
                    [
                        'actions' => ['index'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['POST'],
                ],
            ],
        ];
    }

    /**
     * Lists all Arvmaster models.
     * @return mixed
     */
    public function actionIndex()
    {
        $model = new ImportForm();

        if($model->load(Yii::$app->request->post())) {
            $model->file = UploadedFile::getInstance($model, 'file');
            try {
                // print_r($model->attributes);
                // exit;
                $fileName = $model->file->tempName;
                $datas = \moonland\phpexcel\Excel::widget([
                    // 'models' => $allModels,
                    'fileName' => $fileName,
                    'mode' => 'import',
                    'setFirstRecordAsKeys' => true,
                    'setIndexSheetByName' => true,
                ]);
                
                $models   = [];
                foreach($datas as $k => $p) {
                    $Model = new DynamicModel();
                    $Model->setTableName($model->name);
                    $Model->setAttributes($p, false);
                    $models[] = $Model;
                }
                // print_r($models);
                // exit;
                $transaction = \Yii::$app->db->beginTransaction();

                try {
                    if($model->clear)
                        Yii::$app->db->createCommand()->truncateTable($model->name)->execute();
                    foreach ($models as $modelAddress) {
                        if (! ($flag = $modelAddress->save(false))) {
                            $transaction->rollBack();
                            break;
                        }
                    }

                    if ($flag) {
                        $transaction->commit();
                        Yii::$app->session->setFlash('success', "Data Imported Successful");
                        return $this->redirect(['/'.Yii::$app->controller->id]);
                    }
                } catch (Exception $e) {
                    $transaction->rollBack();
                }
                // exit;
                // Yii::$app->session->setFlash('success', "Data Imported Successful");
                // return $this->redirect(['/'.Yii::$app->controller->id]);
            } catch(Exception $error) {
                print_r($error);
            }
        }
        return $this->render('import', ['model' => $model]);
    }

}
