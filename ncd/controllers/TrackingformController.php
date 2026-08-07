<?php

namespace app\controllers;

use Yii;
use app\models\Trackingform;
use app\models\TrackingformSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\Screening;
use app\models\Registration;

/**
 * TrackingformController implements the CRUD actions for Trackingform model.
 */
class TrackingformController extends Controller
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
                        'actions' => ['index', 'create', 'update', 'view', 'delete','getscrdetails','getregdetails'],
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
     * Lists all Trackingform models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new TrackingformSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Trackingform model.
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
     * Creates a new Trackingform model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Trackingform();

        // if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if ($model->load(Yii::$app->request->post())) {
            $model->track_form_q2 = implode(",", $model->track_form_q2);
            $model->track_form_q3 = implode(",", $model->track_form_q3);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->track_form_id]);
            else {
                $model->track_form_q2 = explode(",", $model->track_form_q2);
                $model->track_form_q3 = explode(",", $model->track_form_q3);
                return $this->render('create', ['model' => $model]);
            }
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Trackingform model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        // if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if ($model->load(Yii::$app->request->post())) {
            $model->track_form_q2 = implode(",", $model->track_form_q2);
            $model->track_form_q3 = implode(",", $model->track_form_q3);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->track_form_id]);
            else {
                $model->track_form_q2 = explode(",", $model->track_form_q2);
                $model->track_form_q3 = explode(",", $model->track_form_q3);
                return $this->render('create', ['model' => $model]);
            }
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Trackingform model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['/'.Yii::$app->controller->id]);
    }
	
	public function actionGetscrdetails()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet)
            $id = $request->get('pid');
        if ($request->isPost)
            $id = $request->post('pid');
        $model = Screening::find()->where(["mem_scrn_part_id" => $id])->one();
       if ($model !== null) 		
        return $model->attributes;
	   
    }
	
	public function actionGetregdetails()
    {
        Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
        $request = Yii::$app->request;
        if ($request->isGet)
            $id = $request->get('pid');
        if ($request->isPost)
            $id = $request->post('pid');
        $model = Registration::find()->where(["corfrm_pid" => $id])->one();
       if ($model !== null) 		
        return $model->attributes;
	   
    }

    /**
     * Finds the Trackingform model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Trackingform the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Trackingform::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
