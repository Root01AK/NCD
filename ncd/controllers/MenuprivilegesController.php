<?php

namespace app\controllers;

use Yii;
use app\base\Model;
use app\models\Submenu;
use app\models\Menuprivileges;
use app\models\MenuprivilegesSearch;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;

/**
 * MenuprivilegesController implements the CRUD actions for Menuprivileges model.
 */
class MenuprivilegesController extends Controller
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
     * Lists all Menuprivileges models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new MenuprivilegesSearch();
        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays a single Menuprivileges model.
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
     * Creates a new Menuprivileges model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    /*
    public function actionCreate()
    {
        $model = new Menuprivileges();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->mnu_acs_id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }
    */

    public function actionCreate()
    {
        $model = new Menuprivileges;
        $models = [];

        if (Yii::$app->request->isAjax && $model->load(Yii::$app->request->post())) {
            // Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
            // $query = Menuprivileges::find()->joinWith('submenus S')->orderBy(["S.min_mnu_id_fk" => SORT_ASC, "S.sub_mnu_desc" => SORT_ASC])->all();
            if($model->mnu_acs_usr_id_fk != "")
                $query = $this->findModelsQuery($model->mnu_acs_usr_id_fk);
            if($model->mnu_acs_mnu_id_fk != "")
                $query = $this->findModelsQuery($model->mnu_acs_usr_id_fk)->andWhere(["mnu_acs_mnu_id_fk" => $model->mnu_acs_mnu_id_fk]);
            $submenus = $query->all();
            if(empty($submenus) || $submenus === null) {
                $submenus = Submenu::find()->andWhere('status = 1')->orderBy(["min_mnu_id_fk" => SORT_ASC, "sub_mnu_desc" => SORT_ASC]);
                if($model->mnu_acs_mnu_id_fk != "")
                    $submenus = $submenus->andWhere(["min_mnu_id_fk" => $model->mnu_acs_mnu_id_fk])->all();
                else
                    $submenus = $submenus->all();
                foreach ($submenus as $key => $value) {
                    $xmodel = new Menuprivileges;
                    $xmodel->mnu_acs_mnu_id_fk = $value->min_mnu_id_fk;
                    $xmodel->mnu_acs_sub_mnu_id_fk = $value->sub_mnu_id;
                    $models[] = $xmodel;
                }
            }
            // return $submenus;
            if(!empty($submenus)) {
                return $this->renderPartial('form', [
                    'model' => $model,
                    'models' => (empty($models)) ? [new Menuprivileges] : $models,
                ]);
            } else {
                return "No Menus";
            }
            // foreach ($submenus as $key => $value) {
                // $xmodel = new Menuprivileges;
                // $xmodel->mnu_acs_mnu_id_fk = $value->min_mnu_id_fk;
                // $xmodel->mnu_acs_sub_mnu_id_fk = $value->sub_mnu_id;
                // $models[] = $xmodel->attributes;
            // }
            $models = $submenus;
            // return \yii\widgets\ActiveForm::validate($model);
            return $models;
        }

        if ($model->load(Yii::$app->request->post())) {

            $post = [];
            $formName = $model->formName();
            $formVars = Yii::$app->request->post($formName);
            
            foreach($formVars as $key => $val) {
                if(is_array($val)) :
                    $post[$formName][] = $val;
                    unset($formVars[$key]);
                endif;
            }
            unset($formVars["mnu_acs_mnu_id_fk"]);
            
            $models = [];
            foreach($post[$formName] as $k => $p) {
                $models[] = new Menuprivileges;
                $posts[$formName][$k] = array_merge($p, $formVars);
            }
            
            Model::loadMultiple($models, $posts);

            // foreach($models as $k => $p) {
            //     print_r($p->attributes);
            //     echo "<br/>";
            // }
            // exit;

            $valid = Model::validateMultiple($models);

            if ($valid) {
                $transaction = \Yii::$app->db->beginTransaction();

                try {
                    foreach ($models as $modelAddress) {
                        if (! ($flag = $modelAddress->save(false))) {
                            $transaction->rollBack();
                            break;
                        }
                    }

                    if ($flag) {
                        $transaction->commit();
                        Yii::$app->session->setFlash('success', "Records Created Successful");
                        return $this->redirect(['/'.Yii::$app->controller->id]);
                        // return $this->redirect(['view', 'id' => $models[0]->mnu_acs_id]);
                    }
                } catch (Exception $e) {
                    $transaction->rollBack();
                }
            }
        } elseif(empty($models)) {
            $submenus = Submenu::find()->andWhere('status = 1')->orderBy(["min_mnu_id_fk" => SORT_ASC, "sub_mnu_desc" => SORT_ASC])->all();
            foreach ($submenus as $key => $value) {
                $xmodel = new Menuprivileges;
                $xmodel->mnu_acs_mnu_id_fk = $value->min_mnu_id_fk;
                $xmodel->mnu_acs_sub_mnu_id_fk = $value->sub_mnu_id;
                $models[] = $xmodel;
            }
        }
        
        return $this->render('create', [
            'model' => $model,
            'models' => (empty($models)) ? [new Menuprivileges] : $models,
        ]);
    }
    /**
     * Updates an existing Menuprivileges model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    /*
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->mnu_acs_id]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }
    */

    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $models = $this->findModels($id);

        if ($model->load(Yii::$app->request->post())) {

            $post = [];
            $formName = $model->formName();
            $formVars = Yii::$app->request->post($formName);
            
            foreach($formVars as $key => $val) {
                if(is_array($val)) :
                    $post[$formName][] = $val;
                    unset($formVars[$key]);
                endif;
            }
            unset($formVars["mnu_acs_mnu_id_fk"]);
            
            $models   = [];
            foreach($post[$formName] as $k => $p) {
                if(empty($p["mnu_acs_id"])) {
                    $models[] = new Menuprivileges;
                    $p["create_user"] = $model->create_user;
                    $p["mnu_acs_usr_id_fk"] = $model->mnu_acs_usr_id_fk;
                }
                else
                    $models[] = $this->findModel($p["mnu_acs_id"]);
                $posts[$formName][$k] = array_merge($p, $formVars);
            }
            
            Model::loadMultiple($models, $posts);
            $valid = Model::validateMultiple($models);

            if ($valid) {
                $transaction = \Yii::$app->db->beginTransaction();

                try {
                    foreach ($models as $modelAddress) {
                        if (! ($flag = $modelAddress->save(false))) {
                            $transaction->rollBack();
                            break;
                        }
                    }

                    if ($flag) {
                        $transaction->commit();
                        Yii::$app->session->setFlash('success', "Records Updated Successful");
                        return $this->redirect(['/'.Yii::$app->controller->id]);
                        // return $this->redirect(['view', 'id' => $models[0]->mnu_acs_id]);
                    }
                } catch (Exception $e) {
                    $transaction->rollBack();
                }
            }
        } else {
            $submenus = Submenu::find()->andWhere('status = 1')->orderBy(["sub_mnu_desc" => SORT_ASC])->all();
            $models = [];
            foreach ($submenus as $key => $value) {
                $xmodel = $this->findModelsQuery($model->mnu_acs_usr_id_fk)->andWhere('mnu_acs_sub_mnu_id_fk = '.$value->sub_mnu_id)->one();
                if ($xmodel === null)
                    $xmodel = new Menuprivileges;

                $xmodel->mnu_acs_mnu_id_fk = $value->min_mnu_id_fk;
                $xmodel->mnu_acs_sub_mnu_id_fk = $value->sub_mnu_id;
                $models[] = $xmodel;
            }
        }

        // foreach($models as $k => $p) {
        //     print_r($p->attributes);
        //     if(isset($p->submenus))
        //         print_r($p->submenus->sub_mnu_desc);
        //     echo "<br/>";
        // }
        // exit;

        return $this->render('update', [
            'model' => $model,
            'models' => (empty($models)) ? [new Menuprivileges] : $models,
        ]);
    }

    /**
     * Deletes an existing Menuprivileges model.
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
     * Finds the Menuprivileges model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Menuprivileges the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Menuprivileges::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function findModels($id)
    {
        $model = Menuprivileges::findOne($id);
        $usr_id = $model->mnu_acs_usr_id_fk;

        if (($models = $this->findModelsQuery($usr_id)->all()) !== null) {
            return $models;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }

    protected function findModelsQuery($id)
    {
        $models = Menuprivileges::find()->where(['mnu_acs_usr_id_fk' => $id])->joinWith('submenus s')->andWhere('s.status = 1');
        return $models;
    }
}
