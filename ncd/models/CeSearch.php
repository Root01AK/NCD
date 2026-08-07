<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Ce;
use app\base\Converter;

/**
 * CeSearch represents the model behind the search form about `app\models\Ce`.
 */
class CeSearch extends Ce
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ce_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['ce_survey', 'ce_date', 'ce_pid', 'ce_loc', 'ce_q1', 'ce_q2', 'ce_q3', 'ce_q4a', 'ce_q4b','ce_q5a', 'ce_q5b','ce_q6','ce_q6a','status','record_date'], 'safe'],
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
		   $query = Ce::find();
	    else
		  $query = Ce::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'ce_date'=> SORT_DESC]
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
            'ce_id' => $this->ce_id,           
            'ce_date' => Converter::toUnixTimeformat($this->ce_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'ce_survey', $this->ce_survey])
            ->andFilterWhere(['like', 'ce_pid', $this->ce_pid])
            ->andFilterWhere(['like', 'ce_loc', $this->ce_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}