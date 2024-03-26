import { Button, TextField } from "@mui/material";
import { useHistory } from "react-router-dom";
import WizardWrapper from "../components/WizardWrapper";
import { useContext, useState } from "react";
import { cleanMnemonic } from "../helpers";
import { BTECFlow, BTECImportPath, ConfigureBTECPath, ConfigureExistingPath, ExistingMnemonicFlow, MNEMONIC_ERROR_SEARCH, VALID_MNEMONIC_LENGTHS, errors } from "../constants";
import Loader from "../components/Loader";
import { KeyCreationContext } from "../KeyCreationContext";
import { BTECContext } from "../BTECContext";

const MnemonicImport = () => {
  const {mnemonic: btecMnemonic, setMnemonic: setBTECMnemonic} = useContext(BTECContext);
  const {mnemonic, setMnemonic} = useContext(KeyCreationContext);
  const history = useHistory();
  const usingBTEC = history.location.pathname === BTECImportPath;

  const [error, setError] = useState("");
  const [inputMnemonic, setInputMnemonic] = useState(usingBTEC ? btecMnemonic : mnemonic);
  const [validatingMnemonic, setValidatingMnemonic] = useState(false);

  const verifyMnemonic = () => {
    setError("");

    const cleanedMnemonic = cleanMnemonic(inputMnemonic);
    setInputMnemonic(cleanedMnemonic);

    const mnemonicArray = cleanedMnemonic.split(" ");

    if (!VALID_MNEMONIC_LENGTHS.includes(mnemonicArray.length)) {
      setError(errors.MNEMONIC_LENGTH_ERROR);
    } else {
      setValidatingMnemonic(true);
      window.eth2Deposit.validateMnemonic(cleanedMnemonic).then(() => {
        if (usingBTEC) {
          setBTECMnemonic(cleanedMnemonic);
        } else {
          setMnemonic(cleanedMnemonic);
        }
        setValidatingMnemonic(false);
        history.push(usingBTEC ? ConfigureBTECPath : ConfigureExistingPath);
      }).catch((error) => {
        const errorMsg = ('stderr' in error) ? error.stderr : error.message;

        if (errorMsg.indexOf(MNEMONIC_ERROR_SEARCH) >= 0) {
          setError(errors.INVALID_MNEMONIC_ERROR);
        } else {
          setError(errorMsg);
        }

        setValidatingMnemonic(false);
      });
    }
  };

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      verifyMnemonic();
    }
  }

  const onBackClick = () => {
    history.replace("/");
  };

  const onNextClick = () => {
    verifyMnemonic();
  };

  return (
    <WizardWrapper
      actionBarItems={[
        <Button variant="contained" color="primary" disabled={validatingMnemonic} onClick={() => onBackClick()} tabIndex={3}>Back</Button>,
        <Button variant="contained" color="primary" disabled={validatingMnemonic} onClick={() => onNextClick()} tabIndex={2}>Import</Button>,
      ]}
      activeTimelineIndex={0}
      timelineItems={usingBTEC ? BTECFlow : ExistingMnemonicFlow}
      title="Import Secret Recovery Phrase"
    >
      <div className="tw-px-20">
        { validatingMnemonic ? (
          <Loader message="Validating secret recovery phrase..." />
        ) : (
          <TextField
            className="tw-mr-2"
            id="mnemonic-input"
            label="Type your Secret Recovery Phrase here"
            multiline
            fullWidth
            rows={4}
            variant="outlined"
            color="primary"
            autoFocus
            error={!!error}
            helperText={error}
            value={inputMnemonic}
            onChange={(e) => setInputMnemonic(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        )}
      </div>
    </WizardWrapper>
  );
};

export default MnemonicImport;

