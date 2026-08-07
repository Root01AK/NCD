<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Surveymaster;

/**
 * SurveymasterSearch represents the model behind the search form about `app\models\Surveymaster`.
 */
class SurveymasterSearch extends Surveymaster
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['sur_id', 'create_user', 'update_user'], 'integer'],
            [['sur_code', 'sur_title', 'sur_url', 'sur_onlne_id', 'sur_pri_db_name', 'sur_pri_db_server', 'sur_pri_db_usrnme', 'sur_pri_db_paswrd', 'sur_sec_db_name', 'sur_sec_db_server', 'sur_sec_db_usrnme', 'sur_sec_db_paswrd', 'status','record_date', 'create_time', 'update_time'], 'safe'],
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
        $query = Surveymaster::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
			'sort'=>[
                'defaultOrder'=>['record_date'=> SORT_DESC],
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
            'sur_id' => $this->sur_id,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
        ]);

        $query->andFilterWhere(['like', 'sur_code', $this->sur_code])
            ->andFilterWhere(['like', 'sur_title', $this->sur_title])
            ->andFilterWhere(['like', 'sur_url', $this->sur_url])
            ->andFilterWhere(['like', 'sur_onlne_id', $this->sur_onlne_id])
            ->andFilterWhere(['like', 'sur_pri_db_name', $this->sur_pri_db_name])
            ->andFilterWhere(['like', 'sur_pri_db_server', $this->sur_pri_db_server])
            ->andFilterWhere(['like', 'sur_pri_db_usrnme', $this->sur_pri_db_usrnme])
            ->andFilterWhere(['like', 'sur_pri_db_paswrd', $this->sur_pri_db_paswrd])
            ->andFilterWhere(['like', 'sur_sec_db_name', $this->sur_sec_db_name])
            ->andFilterWhere(['like', 'sur_sec_db_server', $this->sur_sec_db_server])
            ->andFilterWhere(['like', 'sur_sec_db_usrnme', $this->sur_sec_db_usrnme])
            ->andFilterWhere(['like', 'sur_sec_db_paswrd', $this->sur_sec_db_paswrd])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}
