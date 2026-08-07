<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Mdhl;
use app\base\Converter;

/**
 * MdhlSearch represents the model behind the search form about `app\models\Mdhl`.
 */
class MdhlSearch extends Mdhl
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['mdhl_id','mdhl_q7','mdhl_q8','mdhl_q8a','mdhl_q9','mdhl_q9a','mdhl_q10','mdhl_q11','mdhl_q12','mdhl_q13a','mdhl_q13b','mdhl_q15a','mdhl_q15b','mdhl_q16','mdhl_q17','mdhl_q18','mdhl_q19', 'mdhl_q19a','create_time', 'create_user', 'update_time', 'update_user'], 'integer'],
            [['mdhl_survey', 'mdhl_date', 'mdhl_pid', 'mdhl_loc','mdhl_q6','mdhl_q6a','mdhl_q7a','mdhl_q19b','status','record_date'], 'safe'],
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
		   $query = Mdhl::find();
	    else
		  $query = Mdhl::find()->where(['loc_code'=>$sloc]); 	

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC,'mdhl_date'=> SORT_DESC]
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
            'mdhl_id' => $this->mdhl_id,       
            'mdhl_date' => Converter::toUnixTimeformat($this->mdhl_date),          	
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => Converter::toUnixTimeformat($this->record_date),
        ]);

        $query->andFilterWhere(['like', 'mdhl_survey', $this->mdhl_survey])
            ->andFilterWhere(['like', 'mdhl_pid', $this->mdhl_pid])
            ->andFilterWhere(['like', 'mdhl_loc', $this->mdhl_loc])            
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}