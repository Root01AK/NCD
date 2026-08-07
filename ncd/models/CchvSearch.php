<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Cchv;
use app\base\Converter;

/**
 * CchvSearch represents the model behind the search form about `app\models\Cchv`.
 */
class CchvSearch extends Cchv
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cchv_id','create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['cchv_survey', 'cchv_date', 'cchv_pid', 'cchv_loc','status','record_date','cchv_q53',	'cchv_q54',	'cchv_q55',	'cchv_q55a',	'cchv_q56',	'cchv_q56a',	'cchv_q57',	'cchv_q58',	'cchv_q58a',	'cchv_q59',	'cchv_q60',	'cchv_q61',	'cchv_q61a',	'cchv_q62',	'cchv_q63',	'cchv_q64',	'cchv_q65',	'cchv_q66',	'cchv_q67',	'cchv_q68',	'cchv_q69',	'cchv_q70',	'cchv_q71',	'cchv_q72',	'cchv_q73',	'cchv_q74',	'cchv_q75',	'cchv_q76',	'cchv_q77',	'cchv_q78',	'cchv_q79',	'cchv_q80',	'cchv_q81',	'cchv_q82',	'cchv_q83',	'cchv_q84',	'cchv_q85',	'cchv_q86',	'cchv_q87',	'cchv_q88',	'cchv_q89',	'cchv_q90',	'cchv_q91',	'cchv_q92',	'cchv_q93',	'cchv_q94',	'cchv_q95',	'cchv_q96',	'cchv_q97',	'cchv_q98',	'cchv_q99',	'cchv_q99a',	'cchv_q100',	'cchv_q101',	'cchv_q101a',	'cchv_q102',	'cchv_q103',	'cchv_q104',	'cchv_q104a',	'cchv_q105',	'cchv_q106',	'cchv_q107',	'cchv_q108',	'cchv_q109',	'cchv_q110',	'cchv_q111',	'cchv_q112',	'cchv_q113',	'cchv_q114',	'cchv_q115',	'cchv_q116',	'cchv_q117',	'cchv_q118',	'cchv_q119',	'cchv_q120',	'cchv_q121',	'cchv_q122'
], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function scenarios()
    {
        // bypass scenarios() implementation in the parent class
        return Model::scenarios();
    }

    /**
     * Creates data provider instance with search query applied
     *
     * @param array $params
     *
     * @return ActiveDataProvider
     */
    public function search($params)
    {
       	$sloc=Yii::$app->user->identity->signedin_loc;
		$suser=Yii::$app->user->identity->users_name;
		
		$Usermodel = Users::find()->where(['users_name' => $suser])->one();			   
		$UserRole= $Usermodel->user_role;	
		
		if($UserRole == 1) 
		   $query = Cchv::find();
	    else
		  $query = Cchv::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'cchv_date'=> SORT_DESC]
            ],
        ]);
        if(empty($params))
            $params = Yii::$app->request->post();
        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'cchv_id' => $this->cchv_id,       
            'cchv_date' => Converter::toUnixTimeformat($this->cchv_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'cchv_survey', $this->cchv_survey])
            ->andFilterWhere(['like', 'cchv_pid', $this->cchv_pid])
            ->andFilterWhere(['like', 'cchv_loc', $this->cchv_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}