export default class GroupBody {
  public target: string;
	public name: string;
	public ids: string[];

	constructor(target: string, name: string, ids: string[]) {
		this.target = target;
		this.name = name;
		this.ids = ids;
	}
}
