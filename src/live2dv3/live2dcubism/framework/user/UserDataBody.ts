export default class UserDataBody {
  public target: string;
	public id: string;
	public value: any;

	constructor(target: string, id: string, value: any) {
		this.target = target;
		this.id = id;
		this.value = value;
	}
}
