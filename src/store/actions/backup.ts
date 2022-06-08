import actions from './actions';
import { ok, Result } from '../../utils/result';
import { getDispatch } from '../helpers';

const dispatch = getDispatch();

/**
 * Triggers a full remote backup
 * @return {Promise<Err<unknown> | Ok<string>>}
 */
export const performFullBackup = async (): Promise<Result<string>> => {
	//TODO
	return ok('Backup success');
};

/*
 * This resets the backup store to defaultBackupShape
 */
export const resetBackupStore = (): Result<string> => {
	dispatch({
		type: actions.RESET_BACKUP_STORE,
	});

	return ok('');
};
