<?php

namespace app\models;

use Yii;
use yii\base\Model;
use app\base\Converter;
use yii\data\ActiveDataProvider;
use app\models\Attandance;
use app\models\Users;

/**
 * AttandanceSearch represents the model behind the search form about `app\models\Attandance`.
 */
class AttandanceSearch extends Attandance
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['id',  'create_time', 'create_user', 'update_time', 'update_user', 'record_date', 'ARM'], 'integer'],
            [['sid', 'loc_code', 'pid', 'participant_id', 'interviewer', 'visit', 'visit_date', 'out_interviewer', 'remarks', 'status', 'NextVisit_Date', 'Injection'], 'safe'],
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
		   $query = Attandance::find();
	    else
		  $query = Attandance::find()->where(['loc_code'=>$sloc]); 		

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
            'sort'=>[
                'defaultOrder'=>['visit_date'=> SORT_DESC],
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
            'id' => $this->id,
            // 'visit_date' => $this->visit_date,
            'visit_date' => Converter::toUnixTimeformat($this->visit_date),
			'visit' => $this->visit,
            'visit_in' => $this->visit_in,
            'visit_out' => $this->visit_out,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => $this->record_date,
            'NextVisit_Date' => $this->NextVisit_Date,
            'ARM' => $this->ARM,
        ]);

        $query->andFilterWhere(['like', 'sid', $this->sid])
            ->andFilterWhere(['like', 'location', $this->location])
            ->andFilterWhere(['like', 'pid', $this->pid])
            ->andFilterWhere(['like', 'participant_id', $this->participant_id])
            ->andFilterWhere(['like', 'interviewer', $this->interviewer])
            ->andFilterWhere(['like', 'remarks', $this->remarks])
            ->andFilterWhere(['like', 'status', $this->status])
            ->andFilterWhere(['like', 'Injection', $this->Injection]);

        if(isset($params["visit"]))
            $query->andWhere("visit $params[visit]");
        else
            $query->andFilterWhere(['like', 'visit', $this->visit]);

        if(isset($params["out_interviewer"]))
            $query->andWhere("out_interviewer $params[out_interviewer]");
        else
            $query->andFilterWhere(['like', 'out_interviewer', $this->out_interviewer]);

        return $dataProvider;
    }
}
