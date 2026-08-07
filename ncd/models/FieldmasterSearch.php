<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\data\ActiveDataProvider;
use app\models\Fieldmaster;

/**
 * FieldmasterSearch represents the model behind the search form about `app\models\Fieldmaster`.
 */
class FieldmasterSearch extends Fieldmaster
{
    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['fld_mstr_id', 'create_time', 'create_user', 'update_time', 'update_user', 'record_date'], 'integer'],
            [['fld_mstr_frmfield', 'fld_mstr_code', 'fld_mstr_desc', 'status'], 'safe'],
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
        $query = Fieldmaster::find();

        // add conditions that should always apply here

        $dataProvider = new ActiveDataProvider([
            'query' => $query,
        ]);

        $this->load($params);

        if (!$this->validate()) {
            // uncomment the following line if you do not want to return any records when validation fails
            // $query->where('0=1');
            return $dataProvider;
        }

        // grid filtering conditions
        $query->andFilterWhere([
            'fld_mstr_id' => $this->fld_mstr_id,
            'create_time' => $this->create_time,
            'create_user' => $this->create_user,
            'update_time' => $this->update_time,
            'update_user' => $this->update_user,
            'record_date' => $this->record_date,
        ]);

        $query->andFilterWhere(['like', 'fld_mstr_frmfield', $this->fld_mstr_frmfield])
            ->andFilterWhere(['like', 'fld_mstr_code', $this->fld_mstr_code])
            ->andFilterWhere(['like', 'fld_mstr_desc', $this->fld_mstr_desc])
            ->andFilterWhere(['like', 'status', $this->status]);

        return $dataProvider;
    }
}
