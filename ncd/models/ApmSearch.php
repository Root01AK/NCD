<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Apm;
use app\base\Converter;

/**
 * ApmSearch represents the model behind the search form about `app\models\Apm`.
 */
class ApmSearch extends Apm
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['apm_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['apm_survey', 'apm_date', 'apm_pid', 'apm_loc', 'apm_q1', 'apm_q2', 'apm_q3', 'apm_q4', 'apm_q5','apm_q6','status','record_date'], 'safe'],
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
		   $query = Apm::find();
	    else
		  $query = Apm::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'apm_date'=> SORT_DESC]
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
            'apm_id' => $this->apm_id,           
            'apm_date' => Converter::toUnixTimeformat($this->apm_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'apm_survey', $this->apm_survey])
            ->andFilterWhere(['like', 'apm_pid', $this->apm_pid])
            ->andFilterWhere(['like', 'apm_loc', $this->apm_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}