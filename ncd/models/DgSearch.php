<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Dg;
use app\base\Converter;

/**
 * DgSearch represents the model behind the search form about `app\models\Dg`.
 */
class DgSearch extends Dg
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['dg_id', 'dg_q1', 'dg_q2', 'dg_q4', 'dg_q5', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['dg_survey', 'dg_date', 'dg_pid', 'dg_loc', 'dg_q3', 'dg_q4a','status','record_date'], 'safe'],
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
		   $query = Dg::find();
	    else
		  $query = Dg::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'dg_date'=> SORT_DESC]
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
            'dg_id' => $this->dg_id,
            'dg_q1' => $this->dg_q1,  
            'dg_date' => Converter::toUnixTimeformat($this->dg_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'dg_survey', $this->dg_survey])
            ->andFilterWhere(['like', 'dg_pid', $this->dg_pid])
            ->andFilterWhere(['like', 'dg_loc', $this->dg_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}