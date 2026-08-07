<?php

namespace app\controllers;

use Yii;
use yii\web\Controller;
use yii\web\UploadedFile;
use yii\filters\VerbFilter;
use yii\filters\AccessControl;
use app\models\Attandance;
use app\models\AttandanceSearch;
use yii\data\ActiveDataProvider;
use app\models\LoginForm;
use app\models\ContactForm;
use app\models\ImportForm;
use app\base\Converter;
use ruskid\csvimporter\CSVReader;
use ruskid\csvimporter\CSVImporter;
use app\models\Users;
use app\models\Locationmaster;


class SiteController extends Controller
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
                        'actions' => ['login', 'error'],
                        'allow' => true,
                    ],
                    [
                        'actions' => ['logout', 'index', 'import', 'dashboard', 'auto-refresh'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
            ],
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'logout' => ['post'],
                ],
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        return [
            'error' => [
                'class' => 'yii\web\ErrorAction',
            ],
            'captcha' => [
                'class' => 'yii\captcha\CaptchaAction',
                'fixedVerifyCode' => YII_ENV_TEST ? 'testme' : null,
            ],
        ];
    }

    /**
     * Displays homepage.
     *
     * @return string
     */
    public function actionIndex()
    {
        return $this->render('index');
    }

    /**
     * Login action.
     *
     * @return string
     */
    public function actionLogin()
    {
        if (!Yii::$app->user->isGuest) {
            return $this->goHome();
        }

        $model = new LoginForm();
        if ($model->load(Yii::$app->request->post()) && $model->login()) {			
			 if (($Umodel=Users::findOne(['users_name' => $model->username])) !== null) {          
			      $Umodel->updateAttributes(['signedin_loc' =>$model->loc]);  
				  
                  $LocationMaster = LocationMaster::find()->where(["loc_code" => $model->loc])->andWhere(["status" => 1])->one();	
                  if ($LocationMaster !== null) {
                      $stateid = $LocationMaster->state_code;
                      if ($stateid !== null) {
                          $Umodel->updateAttributes(['state_code' => $stateid]);  
                      }
                  }
             }
            return $this->goBack();
        }
        return $this->render('login', [
            'model' => $model,
        ]);
    }

    /**
     * Logout action.
     *
     * @return string
     */
    public function actionLogout()
    {
        Yii::$app->user->logout();

        return $this->goHome();
    }

    public function actionImport()
    {
        $model = new ImportForm();
        if($model->load(Yii::$app->request->post())) {
            $model->file = UploadedFile::getInstance($model, 'file');
            try {
               $importer = new CSVImporter;
                //Will read CSV file
                $importer->setData(new CSVReader([
                    'filename' => $model->file->tempName,
                    'fgetcsvOptions' => [
                        'delimiter' => ','
                    ]
                ]));

                $table = Yii::$app->db->getTableSchema($model->name);
                $columnkeys = array_keys($table->columns);
                $c = [];
                if($model->clear)
                    Yii::$app->db->createCommand()->truncateTable($model->name)->execute();
                foreach ($importer->getData() as $x => $b) {
                    foreach ($b as $key => $value) {
                        $c[$columnkeys[$key]] = $value;
                    }
                    Yii::$app->db->createCommand()
                        ->insert($model->name, $c)
                        ->execute();
                }
                Yii::$app->session->setFlash('success', "Data Imported Successful");
                return $this->redirect(['/'.Yii::$app->controller->id.'/import']);
            } catch(Exception $error) {
                print_r($error);
            }
        }

        return $this->render('import', ['model' => $model]);
    }

    public function actionDashboard()
    {
        $searchModel = new AttandanceSearch();
        $params = Yii::$app->request->queryParams;
        $params["AttandanceSearch"]["visit_date"] = Converter::toStore(date('d/m/Y'));
        // $dataProvider = $searchModel->search($params);

        // $query = Attandance::find()->where(["visit_date" => Converter::toStore(date('d/m/Y'))]);
        $query = Attandance::find()->where(["between", "visit_date", strtotime(date("Y/m/d")), date('U')]);
        $dataProvider = new ActiveDataProvider(['query' => $query]);

        return $this->render('dashboard/attandance', [
            'searchModel' => $searchModel,
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     * Displays contact page.
     *
     * @return string
     */
    public function actionContact()
    {
        $model = new ContactForm();
        if ($model->load(Yii::$app->request->post()) && $model->contact(Yii::$app->params['adminEmail'])) {
            Yii::$app->session->setFlash('contactFormSubmitted');

            return $this->refresh();
        }
        return $this->render('contact', [
            'model' => $model,
        ]);
    }

    /**
     * Displays about page.
     *
     * @return string
     */
    public function actionAbout()
    {
        return $this->render('about');
    }

    public function actionAutoRefresh()
    {
        if (Yii::$app->request->isAjax) {
            Yii::$app->response->format = \yii\web\Response::FORMAT_JSON;
            $res = array(
                'body'    => date('d-m-Y H:i:s'),
                'success' => true,
            );
            return $res;
        }
        // return $this->renderPartial('auto-refresh', ['time' => date('d-m-Y H:i:s')]);
    }
}
