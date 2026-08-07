<?php

namespace app\controllers;

use Yii;
use app\models\Mortalityform;
use app\models\MortalityformSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;

/**
 * MortalityformController implements the CRUD actions for Mortalityform model.
 */
class MortalityformController extends Controller
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
                        'actions' => ['index', 'create', 'update', 'view', 'delete'],
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
     * Lists all Mortalityform models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new MortalityformSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Mortalityform model.
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
     * Creates a new Mortalityform model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Mortalityform();

        // if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if ($model->load(Yii::$app->request->post())) {
            $model->mortality_form_q1 = implode(",", $model->mortality_form_q1);
            $model->mortality_form_q2 = implode(",", $model->mortality_form_q2);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->mortality_form_id]);
            else {
                $model->mortality_form_q1 = explode(",", $model->mortality_form_q1);
                $model->mortality_form_q2 = explode(",", $model->mortality_form_q2);
                return $this->render('create', ['model' => $model]);
            }
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Mortalityform model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        // if ($model->load(Yii::$app->request->post()) && $model->save()) {
        if ($model->load(Yii::$app->request->post())) {
            $model->mortality_form_q1 = implode(",", $model->mortality_form_q1);
            $model->mortality_form_q2 = implode(",", $model->mortality_form_q2);
            if($model->validate() && $model->save())
                return $this->redirect(['view', 'id' => $model->mortality_form_id]);
            else {
                $model->mortality_form_q1 = explode(",", $model->mortality_form_q1);
                $model->mortality_form_q2 = explode(",", $model->mortality_form_q2);
                return $this->render('update', ['model' => $model]);
            }
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Mortalityform model.
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
     * Finds the Mortalityform model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Mortalityform the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Mortalityform::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}
