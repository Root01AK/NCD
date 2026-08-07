<?php

namespace app\controllers;

use Yii;
use app\models\Cprca;
use app\models\CprcaSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\Clientidref;
use app\models\Applicationsettings;
use app\models\Dg;
use app\base\Converter;

/**
 * CprcaController implements the CRUD actions for Cprca model.
 */
class CprcaController extends Controller
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
                        'actions' => ['index', 'create', 'update', 'view', 'delete', 'getpid'],
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
     * Lists all Cprca models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new CprcaSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Cprca model.
     * @param integer $id
     * @return mixed
     */
    public function actionView($id)
    {
        return $this->render('view', [
            'model' => $this->findModel($id),
        ]);
    }

    /**
     * Creates a new Cprca model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
	
	public function actionCreate()
    {
       $model = new Cprca();
		
		   if (Yii::$app->request->isAjax && $model->load(Yii::$app->request->post())) {
            Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
            return \yii\widgets\ActiveForm::validate($model);
        }   

        // if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if ($model->load(Yii::$app->request->post())) {
		    If($model->cprca_q8 !=="") 
             $model->cprca_q8 = implode(",", $model->cprca_q8);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->cprca_id]);
            else {
                $model->cprca_q8 = explode(",", $model->cprca_q8);               
                return $this->render('create', ['model' => $model]);
            }
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }


    /**
     * Updates an existing Cprca model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if (Yii::$app->request->isAjax && $model->load(Yii::$app->request->post())) {
            Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
            return \yii\widgets\ActiveForm::validate($model);
        }

          if ($model->load(Yii::$app->request->post())) {
		    If($model->cprca_q8 !=="") 
             $model->cprca_q8 = implode(",", $model->cprca_q8);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->cprca_id]);
            else {
                $model->cprca_q8 = explode(",", $model->cprca_q8);               
                return $this->render('update', ['model' => $model]);
            }
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Cprca model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['/'.Yii::$app->controller->id]);
    }

    /**
     * Finds the Cprca model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Cprca the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Cprca::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
	 public function actionGetpid()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet)
            $id = $request->get('pid');
        if ($request->isPost)
            $id = $request->post('pid');
        $model = Dg::find()->where(["dg_pid" => $id])->one();  
        if($model->dg_date != "" && $model->dg_date != NULL)
		return Converter::toDisplay($model->dg_date);		
    }
}
