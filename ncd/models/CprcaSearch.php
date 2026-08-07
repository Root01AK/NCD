<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Cprca;
use app\base\Converter;

/**
 * CprcaSearch represents the model behind the search form about `app\models\Cprca`.
 */
class CprcaSearch extends Cprca
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['cprca_id', 'create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['cprca_survey', 'cprca_date', 'cprca_pid', 'cprca_loc', 'cprca_q9','cprca_q8','status','record_date'], 'safe'],
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
		   $query = Cprca::find();
	    else
		  $query = Cprca::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'cprca_date'=> SORT_DESC]
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
            'cprca_id' => $this->cprca_id,           
            'cprca_date' => Converter::toUnixTimeformat($this->cprca_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'cprca_survey', $this->cprca_survey])
            ->andFilterWhere(['like', 'cprca_pid', $this->cprca_pid])
            ->andFilterWhere(['like', 'cprca_loc', $this->cprca_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}