import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export const ConfirmButton = ({ children, title, body, confirm, onConfirm, testId, variant = "outline", size = "sm", className }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button variant={variant} size={size} className={className} data-testid={testId}>{children}</Button>
    </AlertDialogTrigger>
    <AlertDialogContent data-testid={`${testId}-dialog`}>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{body}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel data-testid={`${testId}-cancel`}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} data-testid={`${testId}-confirm`}>{confirm}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
