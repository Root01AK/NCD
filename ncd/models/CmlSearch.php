<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Cml;
use app\base\Converter;

/**
 * CmlSearch represents the model behind the search form about `app\models\Cml`.
 */
class CmlSearch extends Cml
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cml_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['cml_survey', 'cml_date', 'cml_pid', 'cml_loc', 'cml_q2','cml_q2a', 'cml_q4', 'cml_q4_date','cml_q5','cml_q6','cml_q6a','status','record_date'], 'safe'],
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
		   $query = Cml::find();
	    else
		  $query = Cml::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'cml_date'=> SORT_DESC]
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
            'cml_id' => $this->cml_id,           
            'cml_date' => Converter::toUnixTimeformat($this->cml_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'cml_survey', $this->cml_survey])
            ->andFilterWhere(['like', 'cml_pid', $this->cml_pid])
            ->andFilterWhere(['like', 'cml_loc', $this->cml_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}