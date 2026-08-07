<?php

namespace app\controllers;

use Yii;
use app\base\Model;
use yii\web\Response;
use yii\web\Controller;
use yii\web\UploadedFile;
use yii\web\NotFoundHttpException;
use yii\widgets\ActiveForm;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use yii\helpers\Json;
use yii\helpers\ArrayHelper;
use app\models\Exportmaster;
use app\models\DynamicModel;

/**
 * ExportmasterController implements the CRUD actions for Export model.
 */
class ExportmasterController extends Controller
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
        $model = new Exportmaster();

        if(file_exists('results.json')) {
            $content = file_get_contents('results.json');
            $content = Json::decode($content);
        }

        $connection = Yii::$app->db;
        $dbSchema = $connection->schema;
        $tables = $dbSchema->getTableNames();

        $DB_Tables = [];
        $trindex = 0;
        foreach($tables as $tbl)
        {
            $index = strrpos($tbl, $connection->tablePrefix);
            if($index !== false) {
                $tbl_actual = "{{".str_replace($connection->tablePrefix, "%", $tbl)."}}";
                if(isset($content[$tbl_actual])) {
                    $DB_Tables[$trindex]["chk"] = 1;
                    $DB_Tables[$trindex]["desc"] = $content[$tbl_actual];
                }
                $DB_Tables[$trindex]["name"] = $tbl;
                $models[] = new Exportmaster;
                $trindex++;
            }
        }
        Model::loadMultiple($models, [$model->formName() => $DB_Tables], $model->formName());
        // print_r($models);

        if($model->load(Yii::$app->request->post())) {
            try {
                $models = Model::createMultiple(Exportmaster::classname());
                Model::loadMultiple($models, Yii::$app->request->post());

                // ajax validation
                if (Yii::$app->request->isAjax) {
                    Yii::$app->response->format = Response::FORMAT_JSON;
                    $valid = ActiveForm::validateMultiple($models);
                    return $valid;
                }

                $valid = Model::validateMultiple($models);
                if ($valid) {
                    $DB_Tables = [];
                    foreach ($models as $modelAddress) {
                        if($modelAddress->chk) {
                            $DB_Tables["{{".str_replace($connection->tablePrefix, "%", $modelAddress->name)."}}"] = $modelAddress->desc;
                            // print_r($modelAddress->attributes);
                            // echo "<br>";
                        }
                    }
                    $fp = fopen('results.json', 'w');
                    fwrite($fp, Json::encode($DB_Tables));
                    fclose($fp);
                    Yii::$app->session->setFlash('success', "Records Created Successful");
                    return $this->redirect(['/'.Yii::$app->controller->id]);
                }
            } catch(Exception $error) {
                print_r($error);
            }
        }
        return $this->render('index', ['model' => $model, 'models' => $models, 'connection' => $connection]);
    }

}
