<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Vital;
use app\base\Converter;

/**
 * VitalSearch represents the model behind the search form about `app\models\Vital`.
 */
class VitalSearch extends Vital
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['vital_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['vital_survey', 'vital_date', 'vital_pid', 'vital_loc','vital_bp_diastolic','vital_bp_systolic', 'vital_pulse_rate', 'vital_spo2', 'status','record_date'], 'safe'],
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
		   $query = Vital::find();
	    else
		  $query = Vital::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'vital_date'=> SORT_DESC]
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
            'vital_id' => $this->vital_id,           
            'vital_date' => Converter::toUnixTimeformat($this->vital_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'vital_survey', $this->vital_survey])
            ->andFilterWhere(['like', 'vital_pid', $this->vital_pid])
            ->andFilterWhere(['like', 'vital_loc', $this->vital_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}